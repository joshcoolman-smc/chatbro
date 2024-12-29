import { UploadedFile } from "../types/types";
import {
  FileUploadRepository,
  MockFileUploadRepository,
} from "../repository/file-upload-repository";

export interface FileUploadService {
  uploadFile(file: File): Promise<UploadedFile>;
  uploadFiles(files: FileList): Promise<UploadedFile[]>;
  getFiles(): Promise<UploadedFile[]>;
  removeFile(id: string): Promise<void>;
}

export class MockFileUploadService implements FileUploadService {
  private fileUploadRepository: FileUploadRepository;

  constructor(fileUploadRepository: FileUploadRepository) {
    this.fileUploadRepository = fileUploadRepository;
  }

  async uploadFile(file: File): Promise<UploadedFile> {
    return this.fileUploadRepository.uploadFile(file);
  }

  async uploadFiles(files: FileList): Promise<UploadedFile[]> {
    const uploadPromises = Array.from(files).map((file) =>
      this.fileUploadRepository.uploadFile(file)
    );
    return Promise.all(uploadPromises);
  }

  async getFiles(): Promise<UploadedFile[]> {
    return this.fileUploadRepository.getFiles();
  }

  async removeFile(id: string): Promise<void> {
    return this.fileUploadRepository.removeFile(id);
  }
}

// Factory function to create the service with the mock repository
export const createMockFileUploadService = (): FileUploadService => {
  const fileUploadRepository = new MockFileUploadRepository();
  return new MockFileUploadService(fileUploadRepository);
};
