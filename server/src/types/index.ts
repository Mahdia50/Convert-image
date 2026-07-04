export interface ConversionRequest {
  fileId: string;
  fileName: string;
  outputFormat: string;
  options?: Record<string, unknown>;
}

export interface ConversionResult {
  success: boolean;
  fileId: string;
  outputPath?: string;
  outputName?: string;
  error?: string;
  progress?: number;
}

export interface ConversionJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  fileName: string;
  filePath: string;
  outputFormat: string;
  options: Record<string, unknown>;
  result?: ConversionResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileCategory {
  name: string;
  extensions: string[];
  mimeTypes: string[];
  icon: string;
}

export type ConversionEngine = 'sharp' | 'ffmpeg' | 'ghostscript' | 'libreoffice' | 'pdf-lib' | 'archiver' | 'native' | 'panDoc' | 'mammoth';

export interface FormatMapping {
  from: string[];
  to: string[];
  engine: ConversionEngine;
  category: string;
}

export interface UploadedFile {
  id: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  extension: string;
  uploadedAt: Date;
}
