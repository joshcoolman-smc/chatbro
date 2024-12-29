"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { useChatContext } from "./chat-provider";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MessageContent } from "./message-content";
import { Message } from "../types/types";

export function ChatUI() {
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      await sendMessage(input);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  return (
    <>
      <Card className="flex flex-col w-full border-0 my-8 mb-24">
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="flex flex-col space-y-4 max-w-none">
              {messages.map((message: Message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full break-words rounded-lg px-4 py-2",
                    message.role === "user"
                      ? "ml-auto bg-primary/90 dark:bg-primary/70"
                      : "bg-[#1a1a1a] w-full"
                  )}
                >
                  <MessageContent
                    content={message.content}
                    isUser={message.role === "user"}
                  />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/75 z-50 shadow-lg">
            <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
