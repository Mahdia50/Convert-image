import * as fs from 'fs';
import * as path from 'path';
import * as tmp from 'tmp';
import { v4 as uuid } from 'uuid';
import { UploadedFile } from '../types';

const UPLOAD_DIR = path.join(require('os').tmpdir(), 'pixelforge-uploads');
const OUTPUT_DIR = path.join(require('os').tmpdir(), 'pixelforge-output');

// Ensure temp dirs exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Auto-cleanup older than 1 hour
setInterval(() => {
  cleanupOldFiles(UPLOAD_DIR, 3600000);
  cleanupOldFiles(OUTPUT_DIR, 3600000);
}, 300000);

function cleanupOldFiles(dir: string, maxAge: number) {
  try {
    const files = fs.readdirSync(dir);
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (now - stat.mtimeMs > maxAge) {
          if (stat.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(filePath);
          }
        }
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
}

export function saveUploadedFile(
  originalName: string,
  buffer: Buffer,
  mimeType: string
): UploadedFile {
  const id = uuid();
  const ext = path.extname(originalName).toLowerCase() || '.bin';
  const fileName = `${id}${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  fs.writeFileSync(filePath, buffer);

  return {
    id,
    originalName,
    path: filePath,
    size: buffer.length,
    mimeType,
    extension: ext.replace('.', ''),
    uploadedAt: new Date(),
  };
}

export function getOutputPath(fileId: string, outputFormat: string): string {
  const fileName = `${fileId}.${outputFormat}`;
  return path.join(OUTPUT_DIR, fileName);
}

export function getFilePath(fileId: string, ext: string): string {
  return path.join(UPLOAD_DIR, `${fileId}.${ext}`);
}

export function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch { /* ignore */ }
}

export function cleanupFiles(...paths: string[]): void {
  paths.forEach(p => cleanupFile(p));
}

export function getFileBuffer(filePath: string): Buffer {
  return fs.readFileSync(filePath);
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
