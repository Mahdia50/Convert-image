#!/usr/bin/env node
/**
 * PixelForge — SEO Landing Page Generator
 * 
 * Reads file type mappings and generates individual HTML pages
 * for every conversion pair. Each page is fully optimized with:
 * - Unique SEO title & meta description
 * - JSON-LD schema (SoftwareApplication, FAQPage, HowTo, BreadcrumbList)
 * - Open Graph & Twitter Cards
 * - Hreflang tags
 * - Unique editorial content (300+ words)
 * - Internal linking to related tools
 * 
 * Usage: node scripts/generate-pages.js
 */

const fs = require('fs');
const path = require('path');

// ===================== CONFIGURATION =====================
const SITE_URL = 'https://mahdia50.github.io/Convert-image';
const SITE_NAME = 'Convert-Image';
const BRAND = 'PixelForge';
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

// Format display names & metadata
const FORMAT_INFO = {
  // Images
  png: { name: 'PNG', fullName: 'PNG Image', desc: 'Portable Network Graphics — a lossless image format', mime: 'image/png', color: '#4CAF50' },
  jpg: { name: 'JPG', fullName: 'JPEG Image', desc: 'Joint Photographic Experts Group — a lossy image format', mime: 'image/jpeg', color: '#FF9800' },
  jpeg: { name: 'JPEG', fullName: 'JPEG Image', desc: 'Joint Photographic Experts Group — a lossy image format', mime: 'image/jpeg', color: '#FF9800' },
  webp: { name: 'WEBP', fullName: 'WebP Image', desc: 'Google\'s modern image format with superior compression', mime: 'image/webp', color: '#00BCD4' },
  gif: { name: 'GIF', fullName: 'GIF Image', desc: 'Graphics Interchange Format — supports animation', mime: 'image/gif', color: '#E91E63' },
  bmp: { name: 'BMP', fullName: 'BMP Image', desc: 'Bitmap Image File — uncompressed image format', mime: 'image/bmp', color: '#795548' },
  tiff: { name: 'TIFF', fullName: 'TIFF Image', desc: 'Tagged Image File Format — high-quality image storage', mime: 'image/tiff', color: '#9C27B0' },
  avif: { name: 'AVIF', fullName: 'AVIF Image', desc: 'AV1 Image Format — next-gen royalty-free format', mime: 'image/avif', color: '#FF5722' },
  svg: { name: 'SVG', fullName: 'SVG Vector', desc: 'Scalable Vector Graphics — resolution-independent vector format', mime: 'image/svg+xml', color: '#FFC107' },
  ico: { name: 'ICO', fullName: 'ICO Icon', desc: 'Windows Icon file format', mime: 'image/x-icon', color: '#607D8B' },
  heic: { name: 'HEIC', fullName: 'HEIC Image', desc: 'High Efficiency Image Format — Apple\'s modern format', mime: 'image/heic', color: '#333333' },

  // Documents
  pdf: { name: 'PDF', fullName: 'PDF Document', desc: 'Portable Document Format — universal document format', mime: 'application/pdf', color: '#F44336' },
  doc: { name: 'DOC', fullName: 'Word Document', desc: 'Microsoft Word Document (legacy)', mime: 'application/msword', color: '#1565C0' },
  docx: { name: 'DOCX', fullName: 'Word Document', desc: 'Microsoft Word Open XML Document', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', color: '#1976D2' },
  odt: { name: 'ODT', fullName: 'OpenDocument Text', desc: 'OpenDocument text document format', mime: 'application/vnd.oasis.opendocument.text', color: '#0D47A1' },
  rtf: { name: 'RTF', fullName: 'Rich Text Format', desc: 'Rich Text Format document', mime: 'text/rtf', color: '#42A5F5' },
  txt: { name: 'TXT', fullName: 'Plain Text', desc: 'Plain text file format', mime: 'text/plain', color: '#78909C' },
  html: { name: 'HTML', fullName: 'HTML Document', desc: 'HyperText Markup Language — web page format', mime: 'text/html', color: '#E65100' },
  md: { name: 'MD', fullName: 'Markdown', desc: 'Markdown text formatting language', mime: 'text/markdown', color: '#37474F' },

  // Spreadsheets
  xls: { name: 'XLS', fullName: 'Excel Spreadsheet', desc: 'Microsoft Excel Spreadsheet (legacy)', mime: 'application/vnd.ms-excel', color: '#1B5E20' },
  xlsx: { name: 'XLSX', fullName: 'Excel Spreadsheet', desc: 'Microsoft Excel Open XML Spreadsheet', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', color: '#2E7D32' },
  csv: { name: 'CSV', fullName: 'CSV File', desc: 'Comma-Separated Values — tabular data format', mime: 'text/csv', color: '#388E3C' },
  ods: { name: 'ODS', fullName: 'OpenDocument Spreadsheet', desc: 'OpenDocument spreadsheet format', mime: 'application/vnd.oasis.opendocument.spreadsheet', color: '#1B5E20' },

  // Presentations
  ppt: { name: 'PPT', fullName: 'PowerPoint', desc: 'Microsoft PowerPoint Presentation (legacy)', mime: 'application/vnd.ms-powerpoint', color: '#D84315' },
  pptx: { name: 'PPTX', fullName: 'PowerPoint', desc: 'Microsoft PowerPoint Open XML Presentation', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', color: '#BF360C' },
  odp: { name: 'ODP', fullName: 'OpenDocument Presentation', desc: 'OpenDocument presentation format', mime: 'application/vnd.oasis.opendocument.presentation', color: '#D84315' },

  // Audio
  mp3: { name: 'MP3', fullName: 'MP3 Audio', desc: 'MPEG Audio Layer III — widely-used lossy audio format', mime: 'audio/mpeg', color: '#AD1457' },
  wav: { name: 'WAV', fullName: 'WAV Audio', desc: 'Waveform Audio File Format — uncompressed audio', mime: 'audio/wav', color: '#6A1B9A' },
  aac: { name: 'AAC', fullName: 'AAC Audio', desc: 'Advanced Audio Codec — efficient lossy audio format', mime: 'audio/aac', color: '#8E24AA' },
  flac: { name: 'FLAC', fullName: 'FLAC Audio', desc: 'Free Lossless Audio Codec — high-quality lossless audio', mime: 'audio/flac', color: '#4A148C' },
  ogg: { name: 'OGG', fullName: 'OGG Audio', desc: 'OGG Vorbis — free open-source audio format', mime: 'audio/ogg', color: '#7B1FA2' },
  m4a: { name: 'M4A', fullName: 'M4A Audio', desc: 'MPEG-4 Audio — Apple AAC-based format', mime: 'audio/x-m4a', color: '#CE93D8' },
  wma: { name: 'WMA', fullName: 'WMA Audio', desc: 'Windows Media Audio — Microsoft audio format', mime: 'audio/x-ms-wma', color: '#3F51B5' },

  // Video
  mp4: { name: 'MP4', fullName: 'MP4 Video', desc: 'MPEG-4 Part 14 — universal video container format', mime: 'video/mp4', color: '#B71C1C' },
  avi: { name: 'AVI', fullName: 'AVI Video', desc: 'Audio Video Interleave — Microsoft video container', mime: 'video/x-msvideo', color: '#C62828' },
  mov: { name: 'MOV', fullName: 'MOV Video', desc: 'Apple QuickTime Movie format', mime: 'video/quicktime', color: '#D32F2F' },
  mkv: { name: 'MKV', fullName: 'MKV Video', desc: 'Matroska Video — open-source multimedia container', mime: 'video/x-matroska', color: '#E53935' },
  webm: { name: 'WEBM', fullName: 'WebM Video', desc: 'Google royalty-free video format', mime: 'video/webm', color: '#1B5E20' },
  flv: { name: 'FLV', fullName: 'FLV Video', desc: 'Flash Video — Adobe Flash video format', mime: 'video/x-flv', color: '#37474F' },
  wmv: { name: 'WMV', fullName: 'WMV Video', desc: 'Windows Media Video — Microsoft video format', mime: 'video/x-ms-wmv', color: '#1565C0' },
  mpeg: { name: 'MPEG', fullName: 'MPEG Video', desc: 'Moving Picture Experts Group video format', mime: 'video/mpeg', color: '#C62828' },

  // Archives
  zip: { name: 'ZIP', fullName: 'ZIP Archive', desc: 'Deflate compression archive format', mime: 'application/zip', color: '#F9A825' },
  rar: { name: 'RAR', fullName: 'RAR Archive', desc: 'Roshal Archive — proprietary compressed archive', mime: 'application/x-rar-compressed', color: '#F57F17' },
  '7z': { name: '7Z', fullName: '7-Zip Archive', desc: '7-Zip compressed archive with high compression ratio', mime: 'application/x-7z-compressed', color: '#FBC02D' },
  tar: { name: 'TAR', fullName: 'TAR Archive', desc: 'Tape Archive — uncompressed archive format', mime: 'application/x-tar', color: '#FDD835' },
  gz: { name: 'GZ', fullName: 'GZip Archive', desc: 'GZip compressed file', mime: 'application/gzip', color: '#FFEE58' },

  // eBooks
  epub: { name: 'EPUB', fullName: 'EPUB eBook', desc: 'Electronic Publication — open eBook format', mime: 'application/epub+zip', color: '#00695C' },
  mobi: { name: 'MOBI', fullName: 'MOBI eBook', desc: 'Mobipocket eBook format', mime: 'application/x-mobipocket-ebook', color: '#00897B' },
  azw3: { name: 'AZW3', fullName: 'AZW3 eBook', desc: 'Amazon Kindle Format 8', mime: 'application/vnd.amazon.ebook', color: '#26A69A' },
  fb2: { name: 'FB2', fullName: 'FB2 eBook', desc: 'FictionBook — XML-based eBook format', mime: 'application/x-fictionbook+xml', color: '#4DB6AC' },

  // Data
  json: { name: 'JSON', fullName: 'JSON Data', desc: 'JavaScript Object Notation — lightweight data interchange', mime: 'application/json', color: '#424242' },
  xml: { name: 'XML', fullName: 'XML Data', desc: 'eXtensible Markup Language — structured data format', mime: 'application/xml', color: '#616161' },
  yaml: { name: 'YAML', fullName: 'YAML Data', desc: 'YAML — human-readable data serialization format', mime: 'text/yaml', color: '#757575' },
  toml: { name: 'TOML', fullName: 'TOML Data', desc: 'Tom Obvious Minimal Language — config file format', mime: 'text/x-toml', color: '#9E9E9E' },
};

// ===================== PAGE DEFINITIONS =====================

// Priority conversion pairs — these generate the most traffic
const PRIORITY_PAGES = [
  // Images (highest traffic)
  { from: 'png', to: 'jpg', category: 'images', priority: 1.0, traffic: '210K' },
  { from: 'jpg', to: 'png', category: 'images', priority: 0.95, traffic: '185K' },
  { from: 'webp', to: 'png', category: 'images', priority: 0.9, traffic: '90K' },
  { from: 'png', to: 'webp', category: 'images', priority: 0.85, traffic: '75K' },
  { from: 'jpg', to: 'webp', category: 'images', priority: 0.8, traffic: '55K' },
  { from: 'svg', to: 'png', category: 'images', priority: 0.75, traffic: '40K' },
  { from: 'heic', to: 'jpg', category: 'images', priority: 0.7, traffic: '33K' },
  { from: 'gif', to: 'mp4', category: 'images', priority: 0.7, traffic: '35K' },
  { from: 'avif', to: 'png', category: 'images', priority: 0.6, traffic: '15K' },
  { from: 'bmp', to: 'png', category: 'images', priority: 0.5, traffic: '12K' },
  { from: 'tiff', to: 'jpg', category: 'images', priority: 0.5, traffic: '10K' },
  { from: 'ico', to: 'png', category: 'images', priority: 0.5, traffic: '8K' },
  { from: 'webp', to: 'jpg', category: 'images', priority: 0.6, traffic: '22K' },
  { from: 'png', to: 'ico', category: 'images', priority: 0.4, traffic: '6K' },
  { from: 'svg', to: 'ico', category: 'images', priority: 0.3, traffic: '2K' },
  { from: 'heic', to: 'png', category: 'images', priority: 0.5, traffic: '12K' },
  { from: 'avif', to: 'jpg', category: 'images', priority: 0.5, traffic: '8K' },
  { from: 'jpg', to: 'avif', category: 'images', priority: 0.4, traffic: '5K' },
  { from: 'png', to: 'avif', category: 'images', priority: 0.4, traffic: '5K' },
  { from: 'gif', to: 'webp', category: 'images', priority: 0.4, traffic: '6K' },

  // PDF & Documents (high traffic)
  { from: 'pdf', to: 'docx', category: 'documents', priority: 1.0, traffic: '300K' },
  { from: 'docx', to: 'pdf', category: 'documents', priority: 0.95, traffic: '250K' },
  { from: 'pdf', to: 'jpg', category: 'documents', priority: 0.9, traffic: '170K' },
  { from: 'jpg', to: 'pdf', category: 'documents', priority: 0.85, traffic: '150K' },
  { from: 'pdf', to: 'txt', category: 'documents', priority: 0.7, traffic: '30K' },
  { from: 'txt', to: 'pdf', category: 'documents', priority: 0.65, traffic: '25K' },
  { from: 'html', to: 'pdf', category: 'documents', priority: 0.7, traffic: '55K' },
  { from: 'pdf', to: 'html', category: 'documents', priority: 0.5, traffic: '20K' },
  { from: 'doc', to: 'pdf', category: 'documents', priority: 0.6, traffic: '18K' },
  { from: 'md', to: 'pdf', category: 'documents', priority: 0.5, traffic: '8K' },
  { from: 'pdf', to: 'png', category: 'documents', priority: 0.6, traffic: '15K' },
  { from: 'odt', to: 'pdf', category: 'documents', priority: 0.4, traffic: '5K' },
  { from: 'rtf', to: 'pdf', category: 'documents', priority: 0.4, traffic: '4K' },

  // Spreadsheets
  { from: 'xlsx', to: 'pdf', category: 'spreadsheets', priority: 0.7, traffic: '70K' },
  { from: 'pdf', to: 'xlsx', category: 'spreadsheets', priority: 0.8, traffic: '90K' },
  { from: 'xlsx', to: 'csv', category: 'spreadsheets', priority: 0.6, traffic: '35K' },
  { from: 'csv', to: 'xlsx', category: 'spreadsheets', priority: 0.6, traffic: '30K' },
  { from: 'xls', to: 'xlsx', category: 'spreadsheets', priority: 0.5, traffic: '20K' },
  { from: 'ods', to: 'xlsx', category: 'spreadsheets', priority: 0.3, traffic: '3K' },

  // Presentations
  { from: 'pptx', to: 'pdf', category: 'presentations', priority: 0.7, traffic: '60K' },
  { from: 'pdf', to: 'pptx', category: 'presentations', priority: 0.6, traffic: '40K' },
  { from: 'ppt', to: 'pdf', category: 'presentations', priority: 0.5, traffic: '15K' },
  { from: 'pptx', to: 'pptx', category: 'presentations', priority: 0.3, traffic: '5K' }, // repair

  // Audio (high traffic)
  { from: 'mp4', to: 'mp3', category: 'audio', priority: 1.0, traffic: '200K' },
  { from: 'mp3', to: 'wav', category: 'audio', priority: 0.7, traffic: '40K' },
  { from: 'wav', to: 'mp3', category: 'audio', priority: 0.65, traffic: '35K' },
  { from: 'flac', to: 'mp3', category: 'audio', priority: 0.6, traffic: '25K' },
  { from: 'ogg', to: 'mp3', category: 'audio', priority: 0.5, traffic: '15K' },
  { from: 'aac', to: 'mp3', category: 'audio', priority: 0.5, traffic: '12K' },
  { from: 'mp3', to: 'aac', category: 'audio', priority: 0.4, traffic: '12K' },
  { from: 'wav', to: 'flac', category: 'audio', priority: 0.4, traffic: '8K' },
  { from: 'm4a', to: 'mp3', category: 'audio', priority: 0.4, traffic: '10K' },
  { from: 'wma', to: 'mp3', category: 'audio', priority: 0.3, traffic: '5K' },
  { from: 'mp3', to: 'ogg', category: 'audio', priority: 0.3, traffic: '6K' },
  { from: 'flac', to: 'wav', category: 'audio', priority: 0.3, traffic: '5K' },

  // Video (high traffic)
  { from: 'mp4', to: 'avi', category: 'video', priority: 0.8, traffic: '45K' },
  { from: 'mov', to: 'mp4', category: 'video', priority: 0.85, traffic: '40K' },
  { from: 'avi', to: 'mp4', category: 'video', priority: 0.8, traffic: '35K' },
  { from: 'mkv', to: 'mp4', category: 'video', priority: 0.8, traffic: '40K' },
  { from: 'mp4', to: 'gif', category: 'video', priority: 0.7, traffic: '50K' },
  { from: 'webm', to: 'mp4', category: 'video', priority: 0.6, traffic: '22K' },
  { from: 'mp4', to: 'mov', category: 'video', priority: 0.5, traffic: '15K' },
  { from: 'mp4', to: 'webm', category: 'video', priority: 0.5, traffic: '12K' },
  { from: 'flv', to: 'mp4', category: 'video', priority: 0.5, traffic: '10K' },
  { from: 'wmv', to: 'mp4', category: 'video', priority: 0.4, traffic: '8K' },
  { from: 'mpeg', to: 'mp4', category: 'video', priority: 0.4, traffic: '6K' },
  { from: '3gp', to: 'mp4', category: 'video', priority: 0.3, traffic: '4K' },

  // Archives
  { from: 'zip', to: 'rar', category: 'archives', priority: 0.5, traffic: '12K' },
  { from: 'rar', to: 'zip', category: 'archives', priority: 0.55, traffic: '15K' },
  { from: '7z', to: 'zip', category: 'archives', priority: 0.4, traffic: '8K' },
  { from: 'tar', to: 'zip', category: 'archives', priority: 0.3, traffic: '6K' },
  { from: 'zip', to: '7z', category: 'archives', priority: 0.3, traffic: '5K' },
  { from: 'rar', to: '7z', category: 'archives', priority: 0.25, traffic: '3K' },
  { from: 'gz', to: 'zip', category: 'archives', priority: 0.3, traffic: '4K' },

  // eBooks
  { from: 'epub', to: 'pdf', category: 'ebooks', priority: 0.7, traffic: '40K' },
  { from: 'mobi', to: 'epub', category: 'ebooks', priority: 0.5, traffic: '15K' },
  { from: 'pdf', to: 'epub', category: 'ebooks', priority: 0.6, traffic: '25K' },
  { from: 'epub', to: 'mobi', category: 'ebooks', priority: 0.4, traffic: '18K' },
  { from: 'fb2', to: 'epub', category: 'ebooks', priority: 0.3, traffic: '3K' },
  { from: 'epub', to: 'txt', category: 'ebooks', priority: 0.3, traffic: '5K' },
  { from: 'mobi', to: 'pdf', category: 'ebooks', priority: 0.4, traffic: '8K' },

  // Data
  { from: 'json', to: 'xml', category: 'data', priority: 0.6, traffic: '22K' },
  { from: 'xml', to: 'json', category: 'data', priority: 0.55, traffic: '20K' },
  { from: 'csv', to: 'json', category: 'data', priority: 0.55, traffic: '25K' },
  { from: 'json', to: 'csv', category: 'data', priority: 0.5, traffic: '18K' },
  { from: 'csv', to: 'xml', category: 'data', priority: 0.4, traffic: '8K' },
  { from: 'xml', to: 'csv', category: 'data', priority: 0.4, traffic: '7K' },
  { from: 'yaml', to: 'json', category: 'data', priority: 0.4, traffic: '6K' },
  { from: 'json', to: 'yaml', category: 'data', priority: 0.35, traffic: '5K' },
  { from: 'csv', to: 'yaml', category: 'data', priority: 0.3, traffic: '3K' },
  { from: 'toml', to: 'json', category: 'data', priority: 0.25, traffic: '2K' },
];

// ===================== HELPER FUNCTIONS =====================

function fi(from) { return FORMAT_INFO[from] || { name: from.toUpperCase(), fullName: from.toUpperCase(), desc: `${from.toUpperCase()} format`, mime: 'application/octet-stream', color: '#666' }; }

function slugify(from, to) { return `${from}-to-${to}`; }

function classify(ext) { return ext === 'pdf' ? 'documents' : ext; }

function ucfirst(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

// ===================== CONTENT GENERATION =====================

function generateDescription(from, to) {
  const f = fi(from);
  const t = fi(to);
  return `Convert ${f.fullName} (${from.toUpperCase()}) to ${t.fullName} (${to.toUpperCase()}) online for free with ${BRAND}. No registration, no watermarks, 100% private. Batch conversion with adjustable quality. Fast, secure, and works in your browser.`;
}

function generateTitle(from, to) {
  const f = fi(from);
  const t = fi(to);
  return `Convert ${from.toUpperCase()} to ${to.toUpperCase()} Online Free — ${BRAND} Converter`;
}

function generateIntro(from, to) {
  const f = fi(from);
  const t = fi(to);
  return [
    `Need to convert **${f.fullName} (${from.toUpperCase()})** to **${t.fullName} (${to.toUpperCase()})**? ${BRAND} is a free online ${from.toUpperCase()} to ${to.toUpperCase()} converter that works entirely in your browser. No files are uploaded to our servers — your privacy is 100% guaranteed.`,
    `Whether you need to convert a single file or batch process hundreds, our tool handles it with adjustable settings. No registration, no watermarks, no hidden limits. Just fast, reliable ${from.toUpperCase()} to ${to.toUpperCase()} conversion.`,
  ].join(' ');
}

function generateSteps(from, to) {
  const f = fi(from);
  const t = fi(to);
  return [
    { step: 1, title: `Upload your ${from.toUpperCase()} file`, desc: `Click "Select Files" or drag and drop your ${from.toUpperCase()} file onto the upload area. You can upload multiple files for batch conversion.` },
    { step: 2, title: `Select ${to.toUpperCase()} as output`, desc: `Choose ${to.toUpperCase()} from the output format selector. Adjust quality and resize options as needed.` },
    { step: 3, title: `Convert and download`, desc: `Click "Convert All" to process your files. Once complete, download your converted ${to.toUpperCase()} files individually or as a ZIP archive.` },
  ];
}

function generateWhy(from, to) {
  const f = fi(from);
  const t = fi(to);
  return [
    { icon: '🆓', title: '100% Free', desc: `No hidden charges, no premium tiers, no credit card required. ${from.toUpperCase()} to ${to.toUpperCase()} conversion is completely free.` },
    { icon: '🔒', title: 'Privacy First', desc: 'All processing happens client-side in your browser. Your files never leave your device.' },
    { icon: '📦', title: 'Batch Processing', desc: 'Convert multiple files at once with our powerful batch processing engine.' },
    { icon: '⚡', title: 'Lightning Fast', desc: 'Powered by optimized conversion engines for the fastest possible processing.' },
    { icon: '📱', title: 'Works Everywhere', desc: 'Compatible with all devices — desktop, tablet, and mobile browsers.' },
    { icon: '🎯', title: 'High Quality', desc: 'Adjustable quality settings ensure you get the perfect balance of size and quality.' },
  ];
}

function generateFAQ(from, to) {
  const f = fi(from);
  const t = fi(to);
  return [
    {
      q: `Is converting ${from.toUpperCase()} to ${to.toUpperCase()} free?`,
      a: `Yes, ${BRAND} is 100% free. There are no hidden charges, no premium tiers, and no credit card required. You can convert as many ${from.toUpperCase()} files to ${to.toUpperCase()} as you need.`
    },
    {
      q: `Can I convert multiple ${from.toUpperCase()} files at once?`,
      a: `Absolutely. ${BRAND} supports batch conversion. Upload multiple ${from.toUpperCase()} files and convert them all to ${to.toUpperCase()} simultaneously with a single click.`
    },
    {
      q: `Is my data safe when using ${BRAND}?`,
      a: `Yes. ${BRAND} processes all files client-side in your browser. Your files never leave your device, ensuring complete privacy and security.`
    },
    {
      q: `What is the maximum file size for ${from.toUpperCase()} to ${to.toUpperCase()} conversion?`,
      a: `Since processing happens entirely in your browser, the maximum file size depends on your device available memory. Most modern browsers can handle files up to 500MB.`
    },
    {
      q: `Do I need to register or create an account?`,
      a: `No registration required. ${BRAND} is completely free and open to use without any account creation. Just upload and convert.`
    },
    {
      q: `Can I use ${BRAND} on my mobile phone?`,
      a: `Yes. ${BRAND} works on all devices including smartphones and tablets. The interface is fully responsive and optimized for touch input.`
    },
    {
      q: `Are there any watermarks on the converted files?`,
      a: `No watermarks whatsoever. Your converted ${to.toUpperCase()} files are clean and unmarked.`
    },
    {
      q: `What quality settings can I adjust?`,
      a: `${BRAND} lets you adjust quality from 10% to 100%. For most use cases, 90% offers the best balance between file size and visual quality.`
    },
  ];
}

function generateRelated(from, to, category) {
  // Find other conversion pairs in the same category
  const sameCat = PRIORITY_PAGES.filter(p => p.category === category && !(p.from === from && p.to === to));
  const reverse = sameCat.find(p => p.from === to && p.to === from);
  const others = sameCat.filter(p => !(p.from === to && p.to === from)).slice(0, 8);
  
  const links = [];
  if (reverse) links.push(reverse);
  links.push(...others.slice(0, 7));
  return links;
}

// ===================== PAGE HTML GENERATOR =====================

function generatePage(from, to, pageDef) {
  const f = fi(from);
  const t = fi(to);
  const slug = slugify(from, to);
  const category = pageDef.category;
  const prio = pageDef.priority;
  const fullUrl = `${SITE_URL}/${slug}/`;

  const title = generateTitle(from, to);
  const metaDesc = generateDescription(from, to);
  const intro = generateIntro(from, to);
  const steps = generateSteps(from, to);
  const whys = generateWhy(from, to);
  const faqs = generateFAQ(from, to);
  const related = generateRelated(from, to, category);

  // Build FAQ JSON-LD
  const faqSchema = faqs.map(faq => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a }
  }));

  // Build HowTo JSON-LD
  const howToSteps = steps.map(s => ({
    '@type': 'HowToStep',
    position: s.step,
    name: s.title,
    text: s.desc
  }));

  // Build breadcrumb JSON-LD
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
    { '@type': 'ListItem', position: 2, name: ucfirst(category) + ' Conversion', item: `${SITE_URL}/${category}/` },
    { '@type': 'ListItem', position: 3, name: `${from.toUpperCase()} to ${to.toUpperCase()}`, item: fullUrl },
  ];

  // Related tools HTML
  const relatedHtml = related.map(r => {
    const rf = fi(r.from);
    const rt = fi(r.to);
    const rSlug = slugify(r.from, r.to);
    return `<li><a href="${SITE_URL}/${rSlug}/" title="Convert ${r.from.toUpperCase()} to ${r.to.toUpperCase()}">${r.from.toUpperCase()} to ${r.to.toUpperCase()} Converter</a></li>`;
  }).join('\n          ');

  // Steps HTML
  const stepsHtml = steps.map(s => `
      <div class="step-card">
        <div class="step-number">${s.step}</div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </div>`).join('\n      ');

  // Why us HTML
  const whyHtml = whys.map(w => `
      <div class="why-card">
        <div class="why-icon">${w.icon}</div>
        <h3>${w.title}</h3>
        <p>${w.desc}</p>
      </div>`).join('\n      ');

  // FAQ HTML
  const faqHtml = faqs.map((faq, i) => `
      <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">${faq.q}</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <div itemprop="text"><p>${faq.a}</p></div>
        </div>
      </div>`).join('\n      ');

  // === THE FULL HTML PAGE ===
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- ===== PRIMARY META ===== -->
  <title>${title}</title>
  <meta name="description" content="${metaDesc}">
  <meta name="keywords" content="convert ${from} to ${to}, ${from} to ${to} converter, free ${from} to ${to} converter, online ${from} to ${to}, ${from} ${to} converter online, ${BRAND}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="author" content="${BRAND}">

  <!-- ===== CANONICAL ===== -->
  <link rel="canonical" href="${fullUrl}">

  <!-- ===== OPEN GRAPH ===== -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="${fullUrl}">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:locale" content="en_US">
  <meta property="og:image" content="${SITE_URL}/assets/logo.png">

  <!-- ===== TWITTER ===== -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${metaDesc}">
  <meta name="twitter:image" content="${SITE_URL}/assets/logo.png">

  <!-- ===== HREFLANG ===== -->
  <link rel="alternate" hreflang="en" href="${fullUrl}" />
  <link rel="alternate" hreflang="x-default" href="${fullUrl}" />

  <!-- ===== JSON-LD: SoftwareApplication ===== -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "${BRAND} ${from.toUpperCase()} to ${to.toUpperCase()} Converter",
    "operatingSystem": "All (Web-Based)",
    "applicationCategory": "Multimedia",
    "browserRequirements": "Requires JavaScript",
    "description": "${metaDesc}",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "${BRAND}",
      "url": "${SITE_URL}/"
    },
    "featureList": "Free, No Registration, Batch Processing, Privacy-First, Client-Side Processing"
  }
  </script>

  <!-- ===== JSON-LD: FAQPage ===== -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": ${JSON.stringify(faqSchema, null, 2)}
  }
  </script>

  <!-- ===== JSON-LD: HowTo ===== -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Convert ${from.toUpperCase()} to ${to.toUpperCase()} with ${BRAND}",
    "description": "Follow these simple steps to convert your ${from.toUpperCase()} files to ${to.toUpperCase()} online.",
    "step": ${JSON.stringify(howToSteps)},
    "totalTime": "PT30S",
    "tool": {
      "@type": "HowToTool",
      "name": "${BRAND} ${from.toUpperCase()} to ${to.toUpperCase()} Converter"
    }
  }
  </script>

  <!-- ===== JSON-LD: BreadcrumbList ===== -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": ${JSON.stringify(breadcrumbItems)}
  }
  </script>

  <!-- ===== JSON-LD: Organization ===== -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "${BRAND}",
    "url": "${SITE_URL}/",
    "logo": "${SITE_URL}/assets/logo.png"
  }
  </script>

  <style>
    :root {
      --bg-deep: #0F1923;
      --bg-surface: #0F1923;
      --bg-elevated: #1A2C3E;
      --bg-card: rgba(26, 44, 62, 0.5);
      --text-primary: #E6EDF5;
      --text-secondary: #A0B4C8;
      --text-muted: #6B8BA8;
      --color-primary: #FF5E2C;
      --color-accent: #2AD4C0;
      --color-tertiary: #F7C948;
      --gradient-brand: linear-gradient(135deg, #FF5E2C, #2AD4C0);
      --radius-lg: 16px;
      --radius-md: 12px;
      --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-display: 'Space Grotesk', sans-serif;
      --transition: 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-body); background: var(--bg-deep); color: var(--text-primary); line-height: 1.6; }
    a { color: var(--color-accent); text-decoration: none; }
    a:hover { color: var(--color-primary); }
    .container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }

    /* Header */
    .header { background: var(--bg-surface); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 0; position: sticky; top: 0; z-index: 100; }
    .header-inner { max-width: 1140px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo img { width: 32px; height: 32px; }
    .logo-text { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; background: var(--gradient-brand); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-links { display: flex; gap: 8px; }
    .nav-links a { color: var(--text-secondary); padding: 8px 16px; border-radius: 8px; font-size: 0.875rem; font-weight: 500; transition: var(--transition); }
    .nav-links a:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }

    /* Hero */
    .hero { padding: 60px 0 40px; text-align: center; }
    .hero h1 { font-family: var(--font-display); font-size: 2.75rem; font-weight: 800; line-height: 1.15; margin-bottom: 16px; background: var(--gradient-brand); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 1.125rem; color: var(--text-secondary); max-width: 680px; margin: 0 auto; }

    /* Converter Embed */
    .converter-embed { background: var(--bg-elevated); border-radius: var(--radius-lg); padding: 40px; margin: 40px 0; text-align: center; border: 1px solid rgba(255,255,255,0.08); }
    .converter-embed iframe { width: 100%; height: 500px; border: none; border-radius: var(--radius-md); }
    @media (max-width: 768px) { .converter-embed iframe { height: 400px; } .hero h1 { font-size: 2rem; } }
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: var(--gradient-brand); color: #fff; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 1rem; border: none; cursor: pointer; transition: var(--transition); }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

    /* Content sections */
    .section { padding: 48px 0; }
    .section h2 { font-family: var(--font-display); font-size: 2rem; font-weight: 700; margin-bottom: 24px; }
    .section h2 .highlight { background: var(--gradient-brand); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    /* Steps */
    .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 32px; }
    .step-card { background: var(--bg-card); border-radius: var(--radius-md); padding: 28px; border: 1px solid rgba(255,255,255,0.06); text-align: center; transition: var(--transition); }
    .step-card:hover { border-color: var(--color-primary); transform: translateY(-2px); }
    .step-number { width: 48px; height: 48px; border-radius: 50%; background: var(--gradient-brand); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; margin: 0 auto 16px; color: #fff; }
    .step-card h3 { font-family: var(--font-display); font-size: 1.125rem; margin-bottom: 8px; }
    .step-card p { color: var(--text-secondary); font-size: 0.9375rem; }

    /* Why Grid */
    .why-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 32px; }
    .why-card { background: var(--bg-card); border-radius: var(--radius-md); padding: 28px; border: 1px solid rgba(255,255,255,0.06); }
    .why-icon { font-size: 2rem; margin-bottom: 12px; }
    .why-card h3 { font-family: var(--font-display); font-size: 1.125rem; margin-bottom: 8px; }
    .why-card p { color: var(--text-secondary); font-size: 0.9375rem; }

    /* FAQ */
    .faq-list { display: flex; flex-direction: column; gap: 8px; margin-top: 32px; }
    .faq-item { background: var(--bg-card); border-radius: var(--radius-md); padding: 24px; border: 1px solid rgba(255,255,255,0.06); }
    .faq-item h3 { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 600; margin-bottom: 8px; color: var(--color-accent); cursor: pointer; }
    .faq-item h3:hover { color: var(--color-primary); }
    .faq-item p { color: var(--text-secondary); font-size: 0.9375rem; }

    /* Related Tools */
    .related-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 32px; }
    .related-grid a { background: var(--bg-card); border-radius: var(--radius-md); padding: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.06); font-size: 0.875rem; font-weight: 500; transition: var(--transition); color: var(--text-secondary); }
    .related-grid a:hover { border-color: var(--color-accent); color: var(--text-primary); }

    /* Breadcrumb */
    .breadcrumb { padding: 16px 0; font-size: 0.8125rem; color: var(--text-muted); }
    .breadcrumb a { color: var(--text-muted); }
    .breadcrumb a:hover { color: var(--color-accent); }
    .breadcrumb span { margin: 0 6px; }

    /* Footer */
    .footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 32px 0; text-align: center; color: var(--text-muted); font-size: 0.8125rem; }
    .footer a { color: var(--text-secondary); }

    /* Intro */
    .intro-text { font-size: 1.0625rem; color: var(--text-secondary); line-height: 1.7; max-width: 800px; margin: 0 auto; }

    /* Comparaison */
    .comparison { background: var(--bg-elevated); border-radius: var(--radius-lg); padding: 32px; margin-top: 32px; }
    .comparison table { width: 100%; border-collapse: collapse; }
    .comparison th, .comparison td { padding: 12px 16px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .comparison th { font-family: var(--font-display); font-weight: 600; color: var(--text-primary); }
    .comparison td { color: var(--text-secondary); }

    @media (max-width: 768px) {
      .hero h1 { font-size: 1.75rem; }
      .section h2 { font-size: 1.5rem; }
      .nav-links { display: none; }
      .steps-grid { grid-template-columns: 1fr; }
      .why-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="header-inner">
      <a href="${SITE_URL}/" class="logo">
        <img src="${SITE_URL}/assets/logo.png" alt="${BRAND} — Free Online File Converter" width="32" height="32">
        <span class="logo-text">${BRAND}</span>
      </a>
      <nav class="nav-links">
        <a href="${SITE_URL}/images/" title="Image Converter">Images</a>
        <a href="${SITE_URL}/pdf/" title="PDF Tools">PDF</a>
        <a href="${SITE_URL}/audio/" title="Audio Converter">Audio</a>
        <a href="${SITE_URL}/video/" title="Video Converter">Video</a>
        <a href="${SITE_URL}/archive/" title="Archive Converter">Archives</a>
        <a href="${SITE_URL}/data/" title="Data Converter">Data</a>
        <a href="${SITE_URL}/" title="All Converters">All Tools</a>
      </nav>
    </div>
  </header>

  <div class="container">
    <!-- Breadcrumb -->
    <nav class="breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
      <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a itemprop="item" href="${SITE_URL}/"><span itemprop="name">Home</span></a>
        <meta itemprop="position" content="1">
      </span>
      <span>›</span>
      <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a itemprop="item" href="${SITE_URL}/${category}/"><span itemprop="name">${ucfirst(category)}</span></a>
        <meta itemprop="position" content="2">
      </span>
      <span>›</span>
      <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <span itemprop="name">${from.toUpperCase()} to ${to.toUpperCase()}</span>
        <meta itemprop="position" content="3">
      </span>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <h1>Convert ${from.toUpperCase()} to ${to.toUpperCase()} Online Free</h1>
      <p>Fast, private, and free ${from.toUpperCase()} to ${to.toUpperCase()} converter. No registration, no upload to servers, no watermarks.</p>
    </section>

    <!-- Converter Embed -->
    <section class="converter-embed">
      <h2 style="margin-bottom:16px;font-family:var(--font-display);font-size:1.5rem;">${from.toUpperCase()} to ${to.toUpperCase()} Converter</h2>
      <p style="margin-bottom:24px;color:var(--text-secondary);">Upload your file and convert instantly</p>
      <a href="${SITE_URL}/" class="btn-primary">
        <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 3v14M3 10h14"/></svg>
        Open ${from.toUpperCase()} to ${to.toUpperCase()} Converter
      </a>
      <p style="margin-top:16px;color:var(--text-muted);font-size:0.875rem;">⚡ All processing is done in your browser — your files stay private</p>
    </section>

    <!-- Intro -->
    <section class="section">
      <div class="intro-text">
        <p>${intro}</p>
      </div>
    </section>

    <!-- How to Convert -->
    <section class="section">
      <h2>How to Convert <span class="highlight">${from.toUpperCase()} to ${to.toUpperCase()}</span></h2>
      <p style="color:var(--text-secondary);margin-bottom:24px;">Follow these three simple steps:</p>
      <div class="steps-grid">
        ${stepsHtml}
      </div>
    </section>

    <!-- Why Use -->
    <section class="section">
      <h2>Why Use <span class="highlight">${BRAND}</span> for ${from.toUpperCase()} to ${to.toUpperCase()}?</h2>
      <div class="why-grid">
        ${whyHtml}
      </div>
    </section>

    <!-- Format Comparison -->
    <section class="section">
      <h2>${from.toUpperCase()} vs ${to.toUpperCase()} — Key Differences</h2>
      <div class="comparison">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>${from.toUpperCase()}</th>
              <th>${to.toUpperCase()}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Full Name</td><td>${f.fullName}</td><td>${t.fullName}</td></tr>
            <tr><td>Compression</td><td>${f.desc.includes('lossy') ? 'Lossy' : f.desc.includes('lossless') ? 'Lossless' : 'Varies'}</td><td>${t.desc.includes('lossy') ? 'Lossy' : t.desc.includes('lossless') ? 'Lossless' : 'Varies'}</td></tr>
            <tr><td>Best For</td><td>${f.desc}</td><td>${t.desc}</td></tr>
            <tr><td>MIME Type</td><td><code>${f.mime}</code></td><td><code>${t.mime}</code></td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section" itemscope itemtype="https://schema.org/FAQPage">
      <h2>Frequently Asked Questions</h2>
      <div class="faq-list">
        ${faqHtml}
      </div>
    </section>

    <!-- Related Tools -->
    <section class="section">
      <h2>Related Conversion Tools</h2>
      <div class="related-grid">
        <a href="${SITE_URL}/" title="Universal File Converter">🏠 All Converters</a>
        <a href="${SITE_URL}/${category}/" title="${ucfirst(category)} Converter">📁 All ${ucfirst(category)} Tools</a>
        ${relatedHtml}
      </div>
    </section>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <p>© ${new Date().getFullYear()} <a href="${SITE_URL}/">${BRAND}</a> — Free Online File Converter. Convert images, PDFs, documents, audio, video, and more.</p>
      <p style="margin-top:8px;">
        <a href="${SITE_URL}/">Home</a> &middot;
        <a href="${SITE_URL}/images/">Image Converter</a> &middot;
        <a href="${SITE_URL}/pdf/">PDF Tools</a> &middot;
        <a href="${SITE_URL}/audio/">Audio Converter</a> &middot;
        <a href="${SITE_URL}/video/">Video Converter</a> &middot;
        <a href="${SITE_URL}/data/">Data Converter</a>
      </p>
    </div>
  </footer>
</body>
</html>`;
}

// ===================== CATEGORY HUB PAGES =====================

function generateCategoryHub(category) {
  const pages = PRIORITY_PAGES.filter(p => p.category === category);
  const catNames = { images: 'Image', documents: 'Document', spreadsheets: 'Spreadsheet', presentations: 'Presentation', audio: 'Audio', video: 'Video', archives: 'Archive', ebooks: 'eBook', data: 'Data' };
  const catIcons = { images: '🖼️', documents: '📄', spreadsheets: '📊', presentations: '📽️', audio: '🎵', video: '🎬', archives: '📦', ebooks: '📚', data: '📋' };
  const catName = catNames[category] || ucfirst(category);
  const icon = catIcons[category] || '📁';
  const fullUrl = `${SITE_URL}/${category}/`;

  const toolsHtml = pages.map(p => {
    const f = fi(p.from);
    const t = fi(p.to);
    const slug = slugify(p.from, p.to);
    return `<a href="${SITE_URL}/${slug}/" class="tool-card">
      <div class="tool-icon">${f.name} → ${t.name}</div>
      <div class="tool-name">Convert ${p.from.toUpperCase()} to ${p.to.toUpperCase()}</div>
      <div class="tool-traffic">${p.traffic} monthly searches</div>
    </a>`;
  }).join('\n        ');

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${catName} Converter — Free Online ${catName} Conversion Tools | ${BRAND}</title>
  <meta name="description" content="Free online ${category} converter tools. Convert ${category} files between formats instantly. No registration, no watermarks, 100% private.">
  <link rel="canonical" href="${fullUrl}">
  <meta property="og:title" content="${catName} Converter — Free Online Tools">
  <meta property="og:description" content="Free online ${category} converter. ${pages.length}+ conversion tools available.">
  <meta property="og:url" content="${fullUrl}">
  <meta name="twitter:title" content="${catName} Converter — Free Online Tools">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #0F1923; color: #E6EDF5; line-height: 1.6; }
    .container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
    .header { background: #0F1923; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 0; }
    .header-inner { max-width: 1140px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
    .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .logo-text { font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; font-weight: 700; background: linear-gradient(135deg, #FF5E2C, #2AD4C0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero { text-align: center; padding: 60px 0 32px; }
    .hero h1 { font-family: 'Space Grotesk', sans-serif; font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, #FF5E2C, #2AD4C0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { color: #A0B4C8; font-size: 1.125rem; margin-top: 12px; }
    .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; padding: 40px 0; }
    .tool-card { background: rgba(26,44,62,0.5); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.06); text-decoration: none; transition: 0.3s; }
    .tool-card:hover { border-color: #FF5E2C; transform: translateY(-2px); }
    .tool-icon { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.9375rem; color: #2AD4C0; margin-bottom: 6px; }
    .tool-name { color: #E6EDF5; font-weight: 600; font-size: 1rem; }
    .tool-traffic { color: #6B8BA8; font-size: 0.8125rem; margin-top: 4px; }
    .footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 32px 0; text-align: center; color: #6B8BA8; font-size: 0.8125rem; }
    .footer a { color: #A0B4C8; text-decoration: none; }
    .footer a:hover { color: #2AD4C0; }
    @media (max-width: 768px) { .hero h1 { font-size: 1.75rem; } .tools-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <a href="${SITE_URL}/" class="logo">
        <span class="logo-text">${BRAND}</span>
      </a>
      <nav><a href="${SITE_URL}/" style="color:#A0B4C8;text-decoration:none;font-size:0.875rem;">← All Tools</a></nav>
    </div>
  </header>
  <div class="container">
    <section class="hero">
      <h1>${icon} ${catName} Converter</h1>
      <p>Free online ${category} conversion tools. ${pages.length} converters available.</p>
    </section>
    <div class="tools-grid">
      ${toolsHtml}
    </div>
  </div>
  <footer class="footer">
    <p>© ${new Date().getFullYear()} <a href="${SITE_URL}/">${BRAND}</a> — Free Online File Converter</p>
  </footer>
</body>
</html>`;
}

// ===================== MAIN GENERATOR =====================

function main() {
  console.log('🚀 PixelForge SEO Page Generator');
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📄 Total pages to generate: ${PRIORITY_PAGES.length}\n`);

  // Create output directories
  const dirs = ['', 'images', 'pdf', 'audio', 'video', 'archive', 'ebook', 'data', 'spreadsheets', 'presentations', 'documents'];
  for (const d of dirs) {
    const p = path.join(OUTPUT_DIR, d);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  }

  // Generate category hub pages
  const categories = [...new Set(PRIORITY_PAGES.map(p => p.category))];
  for (const cat of categories) {
    const hubPath = path.join(OUTPUT_DIR, cat, 'index.html');
    const hubHtml = generateCategoryHub(cat);
    fs.writeFileSync(hubPath, hubHtml, 'utf8');
    console.log(`  ✅ Category hub: /${cat}/ (${PRIORITY_PAGES.filter(p => p.category === cat).length} tools)`);
  }

  // Generate individual conversion pages
  for (const page of PRIORITY_PAGES) {
    const { from, to, category } = page;
    const slug = slugify(from, to);
    const pageDir = path.join(OUTPUT_DIR, slug);
    
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
    
    const html = generatePage(from, to, page);
    const pagePath = path.join(pageDir, 'index.html');
    fs.writeFileSync(pagePath, html, 'utf8');
    console.log(`  ✅ Generated: /${slug}/ (${from.toUpperCase()} → ${to.toUpperCase()}) [${page.traffic} searches]`);
  }

  // Generate sitemap
  const sitemapPath = path.join(OUTPUT_DIR, 'sitemap.xml');
  const sitemapContent = generateSitemap();
  fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
  console.log(`\n  ✅ Sitemap: sitemap.xml`);

  console.log(`\n🎉 Done! ${PRIORITY_PAGES.length + categories.length} pages generated.`);
}

function generateSitemap() {
  const urls = [];
  
  // Homepage
  urls.push(`  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);

  // Category hubs
  const categories = [...new Set(PRIORITY_PAGES.map(p => p.category))];
  for (const cat of categories) {
    urls.push(`  <url>
    <loc>${SITE_URL}/${cat}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);
  }

  // Individual pages
  for (const page of PRIORITY_PAGES) {
    const slug = slugify(page.from, page.to);
    urls.push(`  <url>
    <loc>${SITE_URL}/${slug}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

main();
