"use client";

import { ChatProvider } from "./features/chatbot/components/chat-provider";
import { FileUploadProvider } from "./features/file-upload/components/file-upload-provider";
import { ChatUI } from "./features/chatbot/components/chat-ui";

export default function Home() {
  return (
    <FileUploadProvider>
      <ChatProvider>
        <ChatUI />
      </ChatProvider>
    </FileUploadProvider>
  );
}
