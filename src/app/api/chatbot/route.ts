import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { UploadedFile } from "../../features/file-upload/types/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_CONTENT_LENGTH = 50000; // Conservative limit to ensure we stay within token bounds
const MAX_PREVIEW_LENGTH = 1000; // Length of content preview for large files

const systemPrompt = `You are a general answering assistant that must use clean, structured markdown formatting.

Markdown Guidelines:
1. Headers:
   - Use a single # for main title only at the start
   - Use ## for major sections (never duplicate section headers)
   - Use ### for subsections
   - Headers must be unique - never repeat them
   - Never include markdown symbols in header text

2. Lists:
   - Use - for unordered lists
   - Use 1. 2. 3. for ordered lists
   - Maintain consistent indentation
   - No extra newlines between list items
   - Avoid nested lists, prefer flat lists with introductory text

3. Code:
   - Use \`inline code\` for short technical terms
   - Use \`\`\` for code blocks with language specified
   - Proper code block closure

4. Tables:
   - Include header row
   - Use proper column alignment
   - Complete separator row
   - No empty cells

5. Emphasis:
   - Use **bold** for key terms
   - Use *italic* for emphasis
   - Never combine incorrectly

6. Structure:
   - One blank line between sections
   - Clear hierarchy
   - Consistent formatting throughout
   - Each unique piece of information appears exactly once
   - Never duplicate paragraphs or sections
   - No redundant content

When analyzing files:
1. Start with a clear description of the file type and content
2. Note key details systematically
3. Describe relevant context
4. Be objective and precise
5. Maintain professional tone
6. Format using markdown guidelines above

You will be penalized for:
- Any repeated headers or sections
- Any form of content duplication
- Repeating headers, paragraphs, or sections
- Malformed markdown
- Inconsistent structure
- Poor formatting`;

function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;
  const half = Math.floor(maxLength / 2);
  return `${content.slice(
    0,
    half
  )}\n\n[Content truncated due to length...]\n\n${content.slice(-half)}`;
}

function formatAttachment(file: UploadedFile): string {
  // If it's a PDF and we have parsed content, use that
  if (file.type === "application/pdf" && file.parsedContent) {
    const truncatedContent = truncateContent(
      file.parsedContent,
      MAX_PREVIEW_LENGTH
    );
    return `[PDF Analysis: ${file.name}]\n\nExtracted Text Content:\n${truncatedContent}\n\n`;
  }

  // For other files, handle as before
  const content = file.content.startsWith("data:")
    ? file.content.split(",")[1] // Get base64 content after data URL prefix
    : file.content;

  let decodedContent: string;
  try {
    decodedContent = atob(content);
  } catch {
    // If decoding fails, use the original content
    decodedContent = content;
  }

  // Check content length and truncate if necessary
  const truncatedContent = truncateContent(decodedContent, MAX_PREVIEW_LENGTH);
  const contentPreview =
    truncatedContent.length < decodedContent.length
      ? `${truncatedContent}\n\n[Note: File content has been truncated for analysis. Original size: ${decodedContent.length} characters]`
      : truncatedContent;

  return `[File Analysis: ${file.name} (${file.type})]\n\nContent Preview:\n${contentPreview}\n\n`;
}

function truncateHistory(
  messages: ChatCompletionMessageParam[],
  maxLength: number
): ChatCompletionMessageParam[] {
  let totalLength = 0;
  const truncatedMessages: ChatCompletionMessageParam[] = [];

  // Always include system message
  truncatedMessages.push(messages[0]);
  totalLength += JSON.stringify(messages[0]).length;

  // Add messages from newest to oldest until we hit the limit
  for (let i = messages.length - 1; i > 0; i--) {
    const messageLength = JSON.stringify(messages[i]).length;
    if (totalLength + messageLength > maxLength) break;
    truncatedMessages.unshift(messages[i]);
    totalLength += messageLength;
  }

  return truncatedMessages;
}

export async function POST(request: Request) {
  try {
    const { message, history, attachments } = await request.json();

    // Convert history to OpenAI message format
    let messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history
        .slice(-10)
        .map(
          (msg: {
            role: string;
            content: string;
            attachments?: UploadedFile[];
          }) => {
            const role = msg.role as "system" | "user" | "assistant";
            if (msg.attachments?.length) {
              return {
                role,
                content: `${msg.content}\n\n${msg.attachments
                  .map(formatAttachment)
                  .join("\n")}`,
              };
            }
            return {
              role,
              content: msg.content,
            };
          }
        ),
    ];

    // Add the current message with attachments
    messages.push({
      role: "user",
      content: attachments?.length
        ? `${message}\n\n${attachments.map(formatAttachment).join("\n")}`
        : message,
    });

    // Truncate history if needed
    messages = truncateHistory(messages, MAX_CONTENT_LENGTH);

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
      stream: true,
    });

    // Create and return a streaming response
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    let errorContext: Record<string, unknown> = {};
    try {
      const requestData = await request
        .clone()
        .json()
        .catch(() => ({}));
      const { message, attachments } = requestData as {
        message?: string;
        attachments?: UploadedFile[];
      };

      errorContext = {
        messageLength: message?.length ?? 0,
        attachmentsCount: attachments?.length ?? 0,
        attachmentTypes: attachments?.map((file) => file.type) ?? [],
        modelUsed: "gpt-4",
      };
    } catch (parseError) {
      errorContext = {
        error: "Failed to construct error context",
        parseError:
          parseError instanceof Error ? parseError.message : String(parseError),
      };
    }
    console.error("Error in chatbot API:", error, errorContext);

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API Error:", {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type,
      });

      return new Response(
        JSON.stringify({
          error: "OpenAI API Error",
          details: {
            message: error.message,
            type: error.type,
            code: error.code,
          },
        }),
        {
          status: error.status || 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle other errors
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          error: "Failed to process message",
          details: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
