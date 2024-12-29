export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  isGreeting?: boolean;
}

export interface MessageContentProps {
  content: string;
  isUser: boolean;
  isGreeting?: boolean;
}

export interface IChatRepository {
  sendMessage(
    message: string,
    onChunk?: (chunk: string) => void
  ): Promise<string>;
  getMessages(): Promise<Message[]>;
}

export interface IChatService {
  sendMessage(
    message: string,
    onChunk?: (chunk: string) => void
  ): Promise<string>;
  getMessages(): Promise<Message[]>;
}
