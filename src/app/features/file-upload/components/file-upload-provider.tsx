"use client";

import React, { createContext, useContext } from "react";
import {
  FileUploadService,
  createMockFileUploadService,
} from "../service/file-upload-service";

interface FileUploadContextType {
  fileUploadService: FileUploadService;
}

const FileUploadContext = createContext<FileUploadContextType | undefined>(
  undefined
);

export const useFileUpload = () => {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error("useFileUpload must be used within a FileUploadProvider");
  }
  return context;
};

export const FileUploadProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const fileUploadService = createMockFileUploadService();

  return (
    <FileUploadContext.Provider value={{ fileUploadService }}>
      {children}
    </FileUploadContext.Provider>
  );
};
