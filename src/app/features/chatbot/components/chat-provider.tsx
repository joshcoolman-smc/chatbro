"use client";

import { createContext, useContext, ReactNode } from "react";
import { useChat } from "../hooks/use-chat";
import { Message } from "../types/types";

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (
    content: string,
    onChunk?: (chunk: string) => void
  ) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { messages, isLoading, sendMessage } = useChat();

  return (
    <ChatContext.Provider value={{ messages, isLoading, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
