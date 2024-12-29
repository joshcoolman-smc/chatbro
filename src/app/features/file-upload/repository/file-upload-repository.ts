import { UploadedFile } from "../types/types";
import { parsePDF } from "../utils/pdf-parser";

export interface FileUploadRepository {
  uploadFile(file: File): Promise<UploadedFile>;
  getFiles(): Promise<UploadedFile[]>;
  removeFile(id: string): Promise<void>;
}

// Mock implementation
export class MockFileUploadRepository implements FileUploadRepository {
  private files: UploadedFile[] = [];

  async uploadFile(file: File): Promise<UploadedFile> {
    try {
      let parsedContent: string | undefined;
      let preview: string | undefined;

      // Handle PDF files
      if (file.type === "application/pdf") {
        console.log("Processing PDF file:", {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        try {
          const arrayBuffer = await file.arrayBuffer();
          console.log(
            "Successfully converted file to ArrayBuffer, size:",
            arrayBuffer.byteLength
          );
          parsedContent = await parsePDF(arrayBuffer);
          console.log(
            "Successfully parsed PDF content, length:",
            parsedContent.length
          );
        } catch (error) {
          console.error("Error processing PDF:", {
            name: error instanceof Error ? error.name : "UnknownError",
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          });
          // Re-throw with file context
          throw new Error(
            `Failed to process PDF file ${file.name}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }

      // Convert file to base64 for storage
      const reader = new FileReader();
      const content = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      // Generate preview for images
      if (file.type.startsWith("image/")) {
        preview = content;
      }

      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substring(2, 15),
        name: file.name,
        size: file.size,
        type: file.type,
        content,
        preview,
        parsedContent,
      };

      this.files.push(uploadedFile);
      return uploadedFile;
    } catch (error: unknown) {
      console.error("Error in uploadFile:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        error,
      });
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to process file: ${errorMessage}`);
    }
  }

  async getFiles(): Promise<UploadedFile[]> {
    return Promise.resolve(this.files);
  }

  async removeFile(id: string): Promise<void> {
    this.files = this.files.filter((file) => file.id !== id);
    return Promise.resolve();
  }
}
