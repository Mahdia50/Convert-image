#!/usr/bin/env node
/**
 * Update hreflang tags on English pages to link to Arabic counterparts
 * Generate a comprehensive bilingual sitemap
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://mahdia50.github.io/Convert-image';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Mapping: English slug -> Arabic slug
const ENGLISH_TO_ARABIC = {
  '/': '/ar/',
  'png-to-jpg': 'ar/تحويل/png-الى-jpg',
  'jpg-to-png': 'ar/تحويل/jpg-الى-png',
  'webp-to-png': 'ar/تحويل/webp-الى-png',
  'png-to-webp': 'ar/تحويل/png-الى-webp',
  'jpg-to-webp': 'ar/تحويل/jpg-الى-webp',
  'svg-to-png': 'ar/تحويل/svg-الى-png',
  'heic-to-jpg': 'ar/تحويل/heic-الى-jpg',
  'gif-to-mp4': 'ar/تحويل/gif-الى-mp4',
  'avif-to-png': 'ar/تحويل/avif-الى-png',
  'bmp-to-png': 'ar/تحويل/bmp-الى-png',
  'ico-to-png': 'ar/تحويل/ico-الى-png',
  'heic-to-png': 'ar/تحويل/heic-الى-png',
  'avif-to-jpg': 'ar/تحويل/avif-الى-jpg',
  'tiff-to-jpg': 'ar/تحويل/tiff-الى-jpg',
  'jpg-to-pdf': 'ar/تحويل/jpg-الى-pdf',
  'pdf-to-docx': 'ar/تحويل/pdf-الى-docx',
  'docx-to-pdf': 'ar/تحويل/docx-الى-pdf',
  'pdf-to-jpg': 'ar/تحويل/pdf-الى-jpg',
  'pdf-to-txt': 'ar/تحويل/pdf-الى-txt',
  'html-to-pdf': 'ar/تحويل/html-الى-pdf',
  'pdf-to-html': 'ar/تحويل/pdf-الى-html',
  'txt-to-pdf': 'ar/تحويل/txt-الى-pdf',
  'pdf-to-xlsx': 'ar/تحويل/pdf-الى-xlsx',
  'xlsx-to-pdf': 'ar/تحويل/xlsx-الى-pdf',
  'pptx-to-pdf': 'ar/تحويل/pptx-الى-pdf',
  'pdf-to-pptx': 'ar/تحويل/pdf-الى-pptx',
  'mp4-to-mp3': 'ar/تحويل/mp4-الى-mp3',
  'mp3-to-wav': 'ar/تحويل/mp3-الى-wav',
  'wav-to-mp3': 'ar/تحويل/wav-الى-mp3',
  'flac-to-mp3': 'ar/تحويل/flac-الى-mp3',
  'ogg-to-mp3': 'ar/تحويل/ogg-الى-mp3',
  'aac-to-mp3': 'ar/تحويل/aac-الى-mp3',
  'mov-to-mp4': 'ar/تحويل/mov-الى-mp4',
  'avi-to-mp4': 'ar/تحويل/avi-الى-mp4',
  'mkv-to-mp4': 'ar/تحويل/mkv-الى-mp4',
  'mp4-to-avi': 'ar/تحويل/mp4-الى-avi',
  'mp4-to-gif': 'ar/تحويل/mp4-الى-gif',
  'webm-to-mp4': 'ar/تحويل/webm-الى-mp4',
  'flv-to-mp4': 'ar/تحويل/flv-الى-mp4',
  'wmv-to-mp4': 'ar/تحويل/wmv-الى-mp4',
  'rar-to-zip': 'ar/تحويل/rar-الى-zip',
  'zip-to-rar': 'ar/تحويل/zip-الى-rar',
  '7z-to-zip': 'ar/تحويل/7z-الى-zip',
  'xlsx-to-csv': 'ar/تحويل/xlsx-الى-csv',
  'csv-to-xlsx': 'ar/تحويل/csv-الى-xlsx',
  'json-to-xml': 'ar/تحويل/json-الى-xml',
  'xml-to-json': 'ar/تحويل/xml-الى-json',
  'json-to-csv': 'ar/تحويل/json-الى-csv',
  'csv-to-json': 'ar/تحويل/csv-الى-json',
  'images': 'ar/تحويل/',
  'documents': 'ar/تحويل/',
  'audio': 'ar/تحويل/',
  'video': 'ar/تحويل/',
  'archives': 'ar/تحويل/',
  'ebooks': 'ar/تحويل/',
  'data': 'ar/تحويل/',
  'spreadsheets': 'ar/تحويل/',
  'presentations': 'ar/تحويل/',
};

function getArabicSlug(englishSlug) {
  // Remove trailing slash
  const key = englishSlug.replace(/\/$/, '');
  return ENGLISH_TO_ARABIC[key] || null;
}

console.log('🔄 Updating hreflang on English pages...');

// Walk through all English pages
const englishDirs = fs.readdirSync(PUBLIC_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'ar' && d.name !== 'pages' && d.name !== 'blog')
  .map(d => d.name);

let updated = 0;
let skipped = 0;

// Process homepage
const homepagePath = path.join(PUBLIC_DIR, 'index.html');
if (fs.existsSync(homepagePath)) {
  let content = fs.readFileSync(homepagePath, 'utf8');
  // The homepage already has hreflang for ?lang=ar — replace with proper /ar/ path
  const hasArHreflang = content.includes('hreflang="ar"');
  if (hasArHreflang) {
    // Replace the existing hreflang
    content = content.replace(
      /<link rel="alternate" hreflang="ar" href="[^"]+" \/>/,
      `<link rel="alternate" hreflang="ar" href="${SITE_URL}/ar/" />`
    );
    fs.writeFileSync(homepagePath, content, 'utf8');
    updated++;
    console.log(`  ✅ Updated hreflang on homepage`);
  }
}

// Process tool pages
for (const dir of englishDirs) {
  const indexPath = path.join(PUBLIC_DIR, dir, 'index.html');
  if (!fs.existsSync(indexPath)) continue;
  
  const arSlug = getArabicSlug(dir);
  if (!arSlug) {
    skipped++;
    continue;
  }
  
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Check if already has proper Arabic hreflang
  if (content.includes(`hreflang="ar" href="${SITE_URL}/${arSlug}`)) {
    skipped++;
    continue;
  }
  
  // Replace or add Arabic hreflang
  const hreflangRegex = /(<link rel="alternate" hreflang="(?:ar|x-default)"[^>]*\/>)/g;
  const hasAnyHreflang = content.includes('hreflang="ar"');
  
  if (hasAnyHreflang) {
    // Replace the existing Arabic hreflang line
    content = content.replace(
      /<link rel="alternate" hreflang="ar"[^>]*\/>/,
      `<link rel="alternate" hreflang="ar" href="${SITE_URL}/${arSlug}/" />`
    );
  } else {
    // Add Arabic hreflang after x-default
    content = content.replace(
      /(<link rel="alternate" hreflang="x-default"[^>]*\/>)/,
      `$1\n  <link rel="alternate" hreflang="ar" href="${SITE_URL}/${arSlug}/" />`
    );
  }
  
  fs.writeFileSync(indexPath, content, 'utf8');
  updated++;
  console.log(`  ✅ ${dir}/ → Arabic hreflang added`);
}

console.log(`\n📊 Results: ${updated} pages updated, ${skipped} skipped`);
console.log('');

// ===================== GENERATE BILINGUAL SITEMAP =====================
console.log('🗺️ Generating bilingual sitemap...');

const sitemapUrls = [];

// Homepage (English)
sitemapUrls.push(`  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>2026-07-04</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/" />
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}/ar/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />
  </url>`);

// Arabic homepage
sitemapUrls.push(`  <url>
    <loc>${SITE_URL}/ar/</loc>
    <lastmod>2026-07-04</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/" />
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}/ar/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />
  </url>`);

// Category hubs (English)
for (const cat of ['images', 'documents', 'audio', 'video', 'archives', 'ebooks', 'data', 'spreadsheets', 'presentations']) {
  sitemapUrls.push(`  <url>
    <loc>${SITE_URL}/${cat}/</loc>
    <lastmod>2026-07-04</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
}

// Tool pages (English + Arabic pair)
for (const [enSlug, arSlug] of Object.entries(ENGLISH_TO_ARABIC)) {
  if (enSlug === '/') continue;
  if (['images', 'documents', 'audio', 'video', 'archives', 'ebooks', 'data', 'spreadsheets', 'presentations'].includes(enSlug)) continue;
  
  const enUrl = enSlug ? `${SITE_URL}/${enSlug}/` : `${SITE_URL}/`;
  const arUrl = `${SITE_URL}/${arSlug}/`;
  
  sitemapUrls.push(`  <url>
    <loc>${enUrl}</loc>
    <lastmod>2026-07-04</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />
  </url>
  <url>
    <loc>${arUrl}</loc>
    <lastmod>2026-07-04</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />
  </url>`);
}

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapUrls.join('\n')}
</urlset>`;

// Write to root sitemap.xml
fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), sitemapContent, 'utf8');
fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapContent, 'utf8');

const totalUrls = sitemapUrls.length;
console.log(`✅ Bilingual sitemap generated: ${totalUrls} URLs (${totalUrls/2} English + ${totalUrls/2} Arabic)`);
