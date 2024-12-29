import { useState } from "react";
import {
  FileUploadHookReturn,
  UploadedFile,
  MAX_FILES,
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE,
} from "../types/types";
import { useFileUpload } from "../components/file-upload-provider";
import { useToast } from "@/hooks/use-toast";

export const useFileUploadState = (): FileUploadHookReturn => {
  const { fileUploadService } = useFileUpload();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (fileList: FileList): string | null => {
    // Check number of files
    if (files.length + fileList.length > MAX_FILES) {
      return `Maximum ${MAX_FILES} files allowed`;
    }

    // Check each file
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return `${file.name} exceeds maximum size of ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB`;
      }

      // Check file type
      const isValidType = Object.entries(ACCEPTED_FILE_TYPES).some(
        ([mimeType, extensions]) => {
          return (
            file.type === mimeType ||
            extensions.some((ext) => file.name.toLowerCase().endsWith(ext))
          );
        }
      );

      if (!isValidType) {
        return `${file.name} is not a supported file type`;
      }
    }

    return null;
  };

  const uploadFiles = async (fileList: FileList) => {
    try {
      const validationError = validateFiles(fileList);
      if (validationError) {
        setError(validationError);
        toast({
          variant: "destructive",
          title: "Error",
          description: validationError,
        });
        return;
      }

      setIsUploading(true);
      setError(null);

      const uploadPromises = Array.from(fileList).map((file) =>
        fileUploadService.uploadFile(file)
      );

      const uploadedFiles = await Promise.all(uploadPromises);
      setFiles((prev) => [...prev, ...uploadedFiles]);

      toast({
        title: "Success",
        description: `${uploadedFiles.length} file${
          uploadedFiles.length > 1 ? "s" : ""
        } uploaded successfully`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload files";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
    toast({
      title: "File Removed",
      description: "File has been removed from the upload list",
    });
  };

  const clearFiles = () => {
    setFiles([]);
    setError(null);
  };

  return {
    files,
    isUploading,
    error,
    uploadFiles,
    removeFile,
    setError,
    clearFiles,
  };
};
