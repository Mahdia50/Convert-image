import { getFileCategory } from './fileTypes';
import { MAX_FILE_SIZE } from './fileTypes';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(
  fileName: string,
  size: number,
  mimeType: string,
  buffer: Buffer
): ValidationResult {
  // Check file size
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB.`,
    };
  }

  if (size === 0) {
    return { valid: false, error: 'File is empty.' };
  }

  // Detect if file is actually what it claims to be (magic bytes)
  const magicCheck = validateMagicBytes(buffer, mimeType, fileName);
  if (!magicCheck.valid) {
    return magicCheck;
  }

  return { valid: true };
}

function validateMagicBytes(buffer: Buffer, mimeType: string, fileName: string): ValidationResult {
  if (buffer.length < 4) {
    return { valid: true }; // Too small to check
  }

  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // PDF: %PDF
  if (ext === 'pdf' || mimeType === 'application/pdf') {
    if (buffer.slice(0, 4).toString() !== '%PDF') {
      return { valid: false, error: 'File extension is PDF but magic bytes do not match.' };
    }
  }

  // PNG: 89 50 4E 47
  if (ext === 'png' || mimeType === 'image/png') {
    if (buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4E || buffer[3] !== 0x47) {
      return { valid: false, error: 'File extension is PNG but magic bytes do not match.' };
    }
  }

  // JPEG: FF D8 FF
  if (['jpg', 'jpeg'].includes(ext) || mimeType === 'image/jpeg') {
    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8 || buffer[2] !== 0xFF) {
      return { valid: false, error: 'File extension is JPEG but magic bytes do not match.' };
    }
  }

  // GIF: GIF87a or GIF89a
  if (ext === 'gif' || mimeType === 'image/gif') {
    const sig = buffer.slice(0, 3).toString();
    if (sig !== 'GIF') {
      return { valid: false, error: 'File extension is GIF but magic bytes do not match.' };
    }
  }

  // ZIP: PK\x03\x04
  if (['zip', 'docx', 'xlsx', 'pptx', 'epub', 'jar'].includes(ext)) {
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4B || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
      if (ext === 'zip') {
        return { valid: false, error: 'File extension is ZIP but magic bytes do not match.' };
      }
      // For docx/xlsx/pptx/epub they are ZIP-based, but we'll be lenient
    }
  }

  return { valid: true };
}

export function validateOutputFormat(fileExt: string, targetFormat: string): ValidationResult {
  const cleanExt = fileExt.toLowerCase().replace('.', '');
  const cleanTarget = targetFormat.toLowerCase().replace('.', '');

  // Currently no format conversion is invalid per se - we'll try and report errors
  if (cleanExt === cleanTarget) {
    return { valid: true, error: 'Source and target format are the same.' };
  }

  return { valid: true };
}
