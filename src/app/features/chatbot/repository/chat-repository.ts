import { v4 as uuidv4 } from "uuid";
import { IChatRepository, Message } from "../types/types";

// Store messages in memory for this example
let messages: Message[] = [
  {
    id: uuidv4(),
    content: "Hello! How can I help you today?",
    role: "assistant",
    timestamp: new Date(),
    isGreeting: true,
  },
];

export class ChatRepository implements IChatRepository {
  async sendMessage(
    message: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      // Create and add user message first
      const userMessage: Message = {
        id: uuidv4(),
        content: message,
        role: "user",
        timestamp: new Date(),
      };
      messages = [...messages, userMessage];

      // Create placeholder for assistant message
      const assistantId = uuidv4();
      const initialAssistantMessage: Message = {
        id: assistantId,
        content: "",
        role: "assistant",
        timestamp: new Date(),
        isGreeting: false,
      };
      messages = [...messages, initialAssistantMessage];

      // Send message to API and get streaming response
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: messages.slice(0, -1).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(5).trim();

              // Skip if it's the completion token
              if (data === "[DONE]") {
                continue;
              }

              // Only try to parse if we have actual data
              if (data) {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    // Update the assistant message in the messages array
                    messages = messages.map((msg) =>
                      msg.id === assistantId
                        ? {
                            ...msg,
                            content: msg.content + parsed.content,
                          }
                        : msg
                    );

                    // Notify about the new chunk
                    onChunk?.(parsed.content);
                  }
                } catch (e) {
                  console.error("Error parsing chunk:", e);
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Return the final content
      const assistantMessage = messages.find((msg) => msg.id === assistantId);
      return assistantMessage?.content || "";
    } catch (error) {
      console.error("Error in sendMessage:", error);
      // Remove the last two messages (user and assistant) on error
      messages = messages.slice(0, -2);
      throw error;
    }
  }

  async getMessages(): Promise<Message[]> {
    return messages;
  }
}
