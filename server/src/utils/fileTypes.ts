import { FileCategory, FormatMapping } from '../types';

export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/x-icon', 'image/avif', 'image/heic'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.oasis.opendocument.text', 'text/rtf', 'text/plain', 'text/html', 'text/markdown'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/vnd.oasis.opendocument.spreadsheet'],
  presentations: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.oasis.opendocument.presentation'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/ogg', 'audio/x-m4a', 'audio/x-ms-wma'],
  video: ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska', 'video/webm', 'video/x-flv', 'video/x-ms-wmv', 'video/mpeg', 'video/3gpp'],
  archives: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip'],
  ebooks: ['application/epub+zip', 'application/x-mobipocket-ebook', 'application/x-fictionbook+xml'],
  data: ['application/json', 'application/xml', 'text/yaml', 'text/x-toml', 'text/csv'],
};

export function getFileCategory(ext: string): string {
  const extLower = ext.toLowerCase().replace('.', '');
  for (const [category, exts] of Object.entries(FILE_EXTENSIONS)) {
    if (exts.includes(extLower)) return category;
  }
  return 'unknown';
}

export const FILE_EXTENSIONS: Record<string, string[]> = {
  images: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'svg', 'ico', 'avif', 'heic'],
  documents: ['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt', 'html', 'htm', 'md', 'markdown'],
  spreadsheets: ['xls', 'xlsx', 'csv', 'ods'],
  presentations: ['ppt', 'pptx', 'odp'],
  audio: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma'],
  video: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'mpeg', 'mpg', '3gp'],
  archives: ['zip', 'rar', '7z', 'tar', 'gz', 'tgz'],
  ebooks: ['epub', 'mobi', 'azw3', 'fb2'],
  data: ['json', 'xml', 'yaml', 'yml', 'toml', 'csv'],
};

export const FORMAT_MAPPINGS: FormatMapping[] = [
  // Images
  { from: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'avif'], to: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'avif'], engine: 'sharp', category: 'images' },

  // Documents
  { from: ['pdf'], to: ['docx', 'txt', 'html', 'png', 'jpg'], engine: 'ghostscript', category: 'documents' },
  { from: ['doc', 'docx', 'odt', 'rtf', 'txt', 'html', 'md'], to: ['pdf', 'docx', 'txt', 'html', 'md', 'odt', 'rtf'], engine: 'panDoc', category: 'documents' },
  { from: ['md'], to: ['html', 'pdf', 'txt', 'docx'], engine: 'panDoc', category: 'documents' },
  { from: ['html'], to: ['pdf', 'txt', 'md', 'docx'], engine: 'panDoc', category: 'documents' },

  // Spreadsheets
  { from: ['xls', 'xlsx', 'csv', 'ods'], to: ['xlsx', 'csv', 'ods', 'pdf'], engine: 'panDoc', category: 'spreadsheets' },

  // Presentations
  { from: ['ppt', 'pptx', 'odp'], to: ['pptx', 'pdf', 'odp'], engine: 'panDoc', category: 'presentations' },

  // Audio
  { from: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma'], to: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma'], engine: 'ffmpeg', category: 'audio' },

  // Video
  { from: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'mpeg', '3gp'], to: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'mpeg', 'gif'], engine: 'ffmpeg', category: 'video' },
  { from: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'mpeg', '3gp'], to: ['mp3', 'wav', 'aac', 'flac', 'ogg'], engine: 'ffmpeg', category: 'audio' },

  // eBooks
  { from: ['epub', 'mobi', 'azw3', 'fb2'], to: ['epub', 'pdf', 'txt', 'docx'], engine: 'panDoc', category: 'ebooks' },

  // Data
  { from: ['json', 'xml', 'yaml', 'yml', 'toml', 'csv'], to: ['json', 'xml', 'yaml', 'csv'], engine: 'native', category: 'data' },
];

export const CATEGORIES: FileCategory[] = [
  { name: 'images', extensions: FILE_EXTENSIONS.images, mimeTypes: ALLOWED_MIME_TYPES.images, icon: '🖼️' },
  { name: 'documents', extensions: FILE_EXTENSIONS.documents, mimeTypes: ALLOWED_MIME_TYPES.documents, icon: '📄' },
  { name: 'spreadsheets', extensions: FILE_EXTENSIONS.spreadsheets, mimeTypes: ALLOWED_MIME_TYPES.spreadsheets, icon: '📊' },
  { name: 'presentations', extensions: FILE_EXTENSIONS.presentations, mimeTypes: ALLOWED_MIME_TYPES.presentations, icon: '📽️' },
  { name: 'audio', extensions: FILE_EXTENSIONS.audio, mimeTypes: ALLOWED_MIME_TYPES.audio, icon: '🎵' },
  { name: 'video', extensions: FILE_EXTENSIONS.video, mimeTypes: ALLOWED_MIME_TYPES.video, icon: '🎬' },
  { name: 'archives', extensions: FILE_EXTENSIONS.archives, mimeTypes: ALLOWED_MIME_TYPES.archives, icon: '📦' },
  { name: 'ebooks', extensions: FILE_EXTENSIONS.ebooks, mimeTypes: ALLOWED_MIME_TYPES.ebooks, icon: '📚' },
  { name: 'data', extensions: FILE_EXTENSIONS.data, mimeTypes: ALLOWED_MIME_TYPES.data, icon: '📋' },
];

export function findMapping(fromExt: string, toExt: string): FormatMapping | undefined {
  return FORMAT_MAPPINGS.find(m =>
    m.from.includes(fromExt.toLowerCase().replace('.', '')) &&
    m.to.includes(toExt.toLowerCase().replace('.', ''))
  );
}

export function getSupportedTargets(ext: string): string[] {
  const clean = ext.toLowerCase().replace('.', '');
  const targets = new Set<string>();
  FORMAT_MAPPINGS.forEach(m => {
    if (m.from.includes(clean)) m.to.forEach(t => targets.add(t));
  });
  return Array.from(targets).sort();
}
