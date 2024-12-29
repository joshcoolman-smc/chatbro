"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { useFileUploadState } from "../hooks/use-file-upload";
import { cn } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES } from "../types/types";

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  className?: string;
  children?: React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  className,
  children,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles, files, isUploading, error, removeFile } =
    useFileUploadState();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      await uploadFiles(fileList);
      if (onFilesChange) {
        onFilesChange(Array.from(fileList));
      }
      // Reset input value to allow uploading the same file again
      event.target.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Create accept string from ACCEPTED_FILE_TYPES
  const acceptedTypes = Object.entries(ACCEPTED_FILE_TYPES)
    .map(([mimeType, extensions]) => [mimeType, ...extensions])
    .flat()
    .join(",");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={acceptedTypes}
        multiple
      />

      <div className="flex flex-col gap-2">
        {children ? (
          <div onClick={handleClick}>{children}</div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Paperclip className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Attach Files"}
          </Button>
        )}

        {/* File Preview List */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 rounded-md bg-muted"
              >
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </p>
      )}
    </div>
  );
};
