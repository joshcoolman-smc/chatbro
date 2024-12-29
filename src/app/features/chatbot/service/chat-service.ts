import { IChatService, Message } from "../types/types";
import { ChatRepository } from "../repository/chat-repository";

export class ChatService implements IChatService {
  private repository: ChatRepository;

  constructor() {
    this.repository = new ChatRepository();
  }

  async sendMessage(
    message: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    return this.repository.sendMessage(message, onChunk);
  }

  async getMessages(): Promise<Message[]> {
    return this.repository.getMessages();
  }
}
