"use client";

import { cn } from "@/lib/utils";
import { MessageContentProps } from "../types/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { copyToClipboard, downloadMarkdown } from "../utils/message-actions";
import { useToast } from "@/hooks/use-toast";

export function MessageContent({
  content,
  isUser,
  isGreeting,
}: MessageContentProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setHasCopied(true);
      toast({
        description: "Copied to clipboard",
      });
      setTimeout(() => setHasCopied(false), 2000);
    } else {
      toast({
        variant: "destructive",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const handleDownload = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const prefix = isUser ? "user" : "assistant";
    downloadMarkdown(content, `${prefix}-message-${timestamp}.md`);
    toast({
      description: "Downloaded markdown file",
    });
  };

  const showActions = !isUser && !isGreeting;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        className={cn(
          "w-full max-w-full prose prose-sm prose-p:leading-relaxed prose-pre:p-0",
          "dark:prose-invert prose-headings:text-foreground",
          isUser && "text-black font-semibold"
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children, ...props }) => (
              <p className="mb-4 last:mb-0" {...props}>
                {children}
              </p>
            ),
            pre: ({ node, ...props }) => {
              const codeChild = node.children[0];
              if (
                codeChild.type === "element" &&
                codeChild.tagName === "code"
              ) {
                const match = /language-(\w+)/.exec(
                  codeChild.properties?.className?.[0] || ""
                );
                return (
                  <div className="my-4">
                    <SyntaxHighlighter
                      language={(match && match[1]) || "text"}
                      style={tomorrow}
                      customStyle={{
                        margin: 0,
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        background: "rgba(0, 0, 0, 0.5)",
                      }}
                      PreTag="div"
                    >
                      {String(codeChild.children[0].value).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  </div>
                );
              }
              return <pre {...props} />;
            },
            code({ inline, className, children, ...props }) {
              if (inline) {
                return (
                  <code
                    className="bg-[#1a1a1a] px-1.5 py-0.5 rounded-md text-sm"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            a: ({ ...props }) => (
              <a
                className={cn(
                  "hover:underline",
                  isUser ? "text-primary-foreground" : "text-primary"
                )}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            ul: ({ children, ...props }) => (
              <ul className="list-disc list-outside my-2 pl-6" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="list-decimal list-outside my-2 pl-6" {...props}>
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => {
              const flattenContent = (
                content: React.ReactNode
              ): React.ReactNode => {
                if (
                  typeof content === "string" ||
                  typeof content === "number"
                ) {
                  return content;
                }

                if (Array.isArray(content)) {
                  return content.map(flattenContent);
                }

                if (
                  typeof content === "object" &&
                  content !== null &&
                  "type" in content &&
                  "props" in content
                ) {
                  const element = content as {
                    type: string;
                    props: { children: React.ReactNode };
                  };
                  if (element.type === "ul" || element.type === "ol") {
                    return null;
                  }
                  if (element.type === "p") {
                    return flattenContent(element.props.children);
                  }
                }

                return content;
              };

              return <li {...props}>{flattenContent(children)}</li>;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      {showActions && (
        <div className="flex justify-end gap-1 mt-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
          >
            {hasCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">
              {hasCopied ? "Copied" : "Copy message"}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download as markdown</span>
          </Button>
        </div>
      )}
    </div>
  );
}
