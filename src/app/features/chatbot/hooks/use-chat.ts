import { useState, useCallback, useEffect } from "react";
import { Message } from "../types/types";
import { ChatService } from "../service/chat-service";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatService = new ChatService();

  const loadMessages = useCallback(async () => {
    try {
      const loadedMessages = await chatService.getMessages();
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, onChunk?: (chunk: string) => void) => {
      if (!content.trim() || isLoading) return;

      setIsLoading(true);
      try {
        await chatService.sendMessage(content, (chunk) => {
          // Update messages from service after each chunk
          loadMessages();
          // Pass the chunk to the original callback if provided
          onChunk?.(chunk);
        });
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, loadMessages]
  );

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    isLoading,
    sendMessage,
  };
};
