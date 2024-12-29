import { z } from "zod";

export const ACCEPTED_FILE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
  "text/csv": [".csv"],
  "application/json": [".json"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
} as const;

export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB in bytes

export const uploadedFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  content: z.string(), // Base64 encoded content
  preview: z.string().optional(), // URL for image previews
  parsedContent: z.string().optional(), // Parsed text content for PDFs
});

export type UploadedFile = z.infer<typeof uploadedFileSchema>;

export interface FileUploadState {
  files: UploadedFile[];
  isUploading: boolean;
  error: string | null;
}

export interface FileUploadHookReturn extends FileUploadState {
  uploadFiles: (files: FileList) => Promise<void>;
  removeFile: (id: string) => void;
  setError: (error: string | null) => void;
  clearFiles: () => void;
}
