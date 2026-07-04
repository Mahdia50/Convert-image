#!/usr/bin/env node
/**
 * PixelForge — Arabic SEO Landing Page Generator
 * 
 * Generates bilingual pages for every conversion pair:
 * - English: /png-to-jpg/  (already exists from generate-pages.js)
 * - Arabic:  /ar/تحويل/png-الى-jpg/  (NEW)
 * 
 * Arabic pages include:
 * - RTL layout with proper Arabic typography
 * - Unique Arabic SEO meta (NOT translated from English)
 * - Arabic JSON-LD schema
 * - hreflang linking English ↔ Arabic
 * 
 * Usage: node scripts/generate-arabic-pages.js
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://mahdia50.github.io/Convert-image';
const BRAND = 'PixelForge';
const ENGLISH_DIR = path.join(__dirname, '..', 'public');
const ARABIC_DIR = path.join(ENGLISH_DIR, 'ar', 'تحويل');

// ===================== ARABIC FORMAT NAMES =====================
const AR_FORMATS = {
  png: { name: 'PNG', fullName: 'صيغة PNG', desc: 'رسوميات شبكية محمولة — صيغة بدون فقدان للجودة' },
  jpg: { name: 'JPG', fullName: 'صيغة JPEG', desc: 'صيغة الصور المضغوطة الأكثر استخداماً' },
  jpeg: { name: 'JPEG', fullName: 'صيغة JPEG', desc: 'صيغة الصور المضغوطة الأكثر استخداماً' },
  webp: { name: 'WEBP', fullName: 'صيغة WebP', desc: 'صيغة جوجل الحديثة للصور مع ضغط فائق' },
  gif: { name: 'GIF', fullName: 'صيغة GIF', desc: 'صيغة التبادل الرسومي — تدعم الرسوم المتحركة' },
  bmp: { name: 'BMP', fullName: 'صيغة BMP', desc: 'صيغة الصور النقطية — بدون ضغط' },
  tiff: { name: 'TIFF', fullName: 'صيغة TIFF', desc: 'صيغة ملفات الصور الموسومة — جودة عالية' },
  avif: { name: 'AVIF', fullName: 'صيغة AVIF', desc: 'صيغة الصور AV1 — الجيل التالي من الصور' },
  svg: { name: 'SVG', fullName: 'صيغة SVG', desc: 'رسوميات متجهية قابلة للتمديد — صيغة متجهية' },
  ico: { name: 'ICO', fullName: 'صيغة ICO', desc: 'صيغة أيقونات ويندوز' },
  heic: { name: 'HEIC', fullName: 'صيغة HEIC', desc: 'صيغة الصور عالية الكفاءة — صيغة أبل الحديثة' },
  pdf: { name: 'PDF', fullName: 'مستند PDF', desc: 'صيغة المستندات المحمولة — صيغة عالمية' },
  doc: { name: 'DOC', fullName: 'مستند Word', desc: 'مستند مايكروسوفت وورد (قديم)' },
  docx: { name: 'DOCX', fullName: 'مستند Word', desc: 'مستند مايكروسوفت وورد المفتوح' },
  txt: { name: 'TXT', fullName: 'نص عادي', desc: 'صيغة النص العادي' },
  html: { name: 'HTML', fullName: 'مستند HTML', desc: 'لغة ترميز النص التشعبي' },
  md: { name: 'MD', fullName: 'ماركداون', desc: 'لغة تنسيق النص ماركداون' },
  xlsx: { name: 'XLSX', fullName: 'جداول Excel', desc: 'جداول بيانات إكسل المفتوحة' },
  xls: { name: 'XLS', fullName: 'جداول Excel', desc: 'جداول بيانات إكسل (قديم)' },
  csv: { name: 'CSV', fullName: 'ملف CSV', desc: 'قيم مفصولة بفواصل — صيغة بيانات جدولية' },
  pptx: { name: 'PPTX', fullName: 'عرض تقديمي', desc: 'عرض بوربوينت تقديمي' },
  ppt: { name: 'PPT', fullName: 'عرض تقديمي', desc: 'عرض بوربوينت (قديم)' },
  mp3: { name: 'MP3', fullName: 'صيغة MP3', desc: 'صيغة صوتية مضغوطة عالية الانتشار' },
  wav: { name: 'WAV', fullName: 'صيغة WAV', desc: 'صيغة صوتية غير مضغوطة' },
  aac: { name: 'AAC', fullName: 'صيغة AAC', desc: 'ترميز صوتي متقدم — صيغة فعالة' },
  flac: { name: 'FLAC', fullName: 'صيغة FLAC', desc: 'صيغة صوتية بدون فقدان عالية الجودة' },
  ogg: { name: 'OGG', fullName: 'صيغة OGG', desc: 'صيغة صوتية مفتوحة المصدر' },
  m4a: { name: 'M4A', fullName: 'صيغة M4A', desc: 'ملف صوتي MPEG-4' },
  wma: { name: 'WMA', fullName: 'صيغة WMA', desc: 'ملف صوتي ويندوز ميديا' },
  mp4: { name: 'MP4', fullName: 'صيغة MP4', desc: 'صيغة فيديو عالمية' },
  avi: { name: 'AVI', fullName: 'صيغة AVI', desc: 'صيغة فيديو مايكروسوفت' },
  mov: { name: 'MOV', fullName: 'صيغة MOV', desc: 'صيغة فيديو كويك تايم من أبل' },
  mkv: { name: 'MKV', fullName: 'صيغة MKV', desc: 'حاوية فيديو مفتوحة المصدر' },
  webm: { name: 'WEBM', fullName: 'صيغة WebM', desc: 'صيغة فيديو من جوجل' },
  flv: { name: 'FLV', fullName: 'صيغة FLV', desc: 'صيغة فيديو فلاش' },
  wmv: { name: 'WMV', fullName: 'صيغة WMV', desc: 'صيغة فيديو ويندوز ميديا' },
  zip: { name: 'ZIP', fullName: 'ملف ZIP', desc: 'ملف مضغوط بصيغة ZIP' },
  rar: { name: 'RAR', fullName: 'ملف RAR', desc: 'ملف مضغوط بصيغة RAR' },
  '7z': { name: '7Z', fullName: 'ملف 7Z', desc: 'ملف مضغوط بصيغة 7z عالي الضغط' },
  tar: { name: 'TAR', fullName: 'ملف TAR', desc: 'ملف أرشيف TAR' },
  epub: { name: 'EPUB', fullName: 'كتاب EPUB', desc: 'صيغة الكتاب الإلكتروني المفتوحة' },
  mobi: { name: 'MOBI', fullName: 'كتاب MOBI', desc: 'صيغة كتب أمازون كيندل' },
  fb2: { name: 'FB2', fullName: 'كتاب FB2', desc: 'صيغة FictionBook XML' },
  json: { name: 'JSON', fullName: 'بيانات JSON', desc: 'صيغة تبادل البيانات خفيفة الوزن' },
  xml: { name: 'XML', fullName: 'بيانات XML', desc: 'لغة الترميز الموسعة للبيانات' },
  yaml: { name: 'YAML', fullName: 'بيانات YAML', desc: 'صيغة بيانات قابلة للقراءة البشرية' },
};

// ===================== CONVERSION PAIRS (same as English version) =====================
const PRIORITY_PAGES = [
  // Images
  { from: 'png', to: 'jpg', category: 'images', priority: 1.0, traffic: '8.1K' },
  { from: 'jpg', to: 'png', category: 'images', priority: 0.95, traffic: '6.5K' },
  { from: 'webp', to: 'png', category: 'images', priority: 0.9, traffic: '2.8K' },
  { from: 'png', to: 'webp', category: 'images', priority: 0.85, traffic: '1.5K' },
  { from: 'jpg', to: 'webp', category: 'images', priority: 0.8, traffic: '1.2K' },
  { from: 'svg', to: 'png', category: 'images', priority: 0.75, traffic: '1.2K' },
  { from: 'heic', to: 'jpg', category: 'images', priority: 0.7, traffic: '1.8K' },
  { from: 'gif', to: 'mp4', category: 'images', priority: 0.7, traffic: '900' },
  { from: 'avif', to: 'png', category: 'images', priority: 0.6, traffic: '800' },
  { from: 'bmp', to: 'png', category: 'images', priority: 0.5, traffic: '700' },
  { from: 'ico', to: 'png', category: 'images', priority: 0.5, traffic: '600' },
  { from: 'heic', to: 'png', category: 'images', priority: 0.5, traffic: '500' },
  { from: 'avif', to: 'jpg', category: 'images', priority: 0.5, traffic: '400' },
  { from: 'tiff', to: 'jpg', category: 'images', priority: 0.5, traffic: '500' },
  { from: 'jpg', to: 'pdf', category: 'images', priority: 0.85, traffic: '4.2K' },

  // PDF & Documents
  { from: 'pdf', to: 'docx', category: 'documents', priority: 1.0, traffic: '12K' },
  { from: 'docx', to: 'pdf', category: 'documents', priority: 0.95, traffic: '7.2K' },
  { from: 'pdf', to: 'jpg', category: 'documents', priority: 0.9, traffic: '8.5K' },
  { from: 'jpg', to: 'pdf', category: 'documents', priority: 0.85, traffic: '5.4K' },
  { from: 'pdf', to: 'txt', category: 'documents', priority: 0.7, traffic: '1.4K' },
  { from: 'html', to: 'pdf', category: 'documents', priority: 0.7, traffic: '1.8K' },
  { from: 'pdf', to: 'html', category: 'documents', priority: 0.5, traffic: '800' },
  { from: 'txt', to: 'pdf', category: 'documents', priority: 0.65, traffic: '1K' },
  { from: 'pdf', to: 'xlsx', category: 'spreadsheets', priority: 0.8, traffic: '4.5K' },
  { from: 'xlsx', to: 'pdf', category: 'spreadsheets', priority: 0.7, traffic: '3.2K' },
  { from: 'pptx', to: 'pdf', category: 'presentations', priority: 0.7, traffic: '2.1K' },
  { from: 'pdf', to: 'pptx', category: 'presentations', priority: 0.6, traffic: '1.5K' },

  // Audio
  { from: 'mp4', to: 'mp3', category: 'audio', priority: 1.0, traffic: '15K' },
  { from: 'mp3', to: 'wav', category: 'audio', priority: 0.7, traffic: '3.2K' },
  { from: 'wav', to: 'mp3', category: 'audio', priority: 0.65, traffic: '2.5K' },
  { from: 'flac', to: 'mp3', category: 'audio', priority: 0.6, traffic: '1.1K' },
  { from: 'ogg', to: 'mp3', category: 'audio', priority: 0.5, traffic: '800' },
  { from: 'aac', to: 'mp3', category: 'audio', priority: 0.5, traffic: '600' },

  // Video
  { from: 'mov', to: 'mp4', category: 'video', priority: 0.85, traffic: '2.8K' },
  { from: 'avi', to: 'mp4', category: 'video', priority: 0.8, traffic: '2.2K' },
  { from: 'mkv', to: 'mp4', category: 'video', priority: 0.8, traffic: '2K' },
  { from: 'mp4', to: 'avi', category: 'video', priority: 0.8, traffic: '1.5K' },
  { from: 'mp4', to: 'gif', category: 'video', priority: 0.7, traffic: '1K' },
  { from: 'webm', to: 'mp4', category: 'video', priority: 0.6, traffic: '800' },
  { from: 'flv', to: 'mp4', category: 'video', priority: 0.5, traffic: '600' },
  { from: 'wmv', to: 'mp4', category: 'video', priority: 0.4, traffic: '500' },

  // Archives
  { from: 'rar', to: 'zip', category: 'archives', priority: 0.55, traffic: '1.8K' },
  { from: 'zip', to: 'rar', category: 'archives', priority: 0.5, traffic: '1.2K' },
  { from: '7z', to: 'zip', category: 'archives', priority: 0.4, traffic: '600' },

  // Data
  { from: 'xlsx', to: 'csv', category: 'spreadsheets', priority: 0.6, traffic: '2.2K' },
  { from: 'csv', to: 'xlsx', category: 'spreadsheets', priority: 0.6, traffic: '1.8K' },
  { from: 'json', to: 'xml', category: 'data', priority: 0.6, traffic: '1.5K' },
  { from: 'xml', to: 'json', category: 'data', priority: 0.55, traffic: '1.3K' },
  { from: 'json', to: 'csv', category: 'data', priority: 0.5, traffic: '1.1K' },
  { from: 'csv', to: 'json', category: 'data', priority: 0.55, traffic: '900' },
];

// ===================== HELPER FUNCTIONS =====================
function af(from) { return AR_FORMATS[from] || { name: from.toUpperCase(), fullName: from.toUpperCase(), desc: `صيغة ${from.toUpperCase()}` }; }

function arSlug(from, to) { return `${from}-الى-${to}`; }

function arCatName(category) {
  const names = {
    images: 'تحويل الصور', documents: 'تحويل المستندات', spreadsheets: 'جداول البيانات',
    presentations: 'العروض التقديمية', audio: 'تحويل الصوت', video: 'تحويل الفيديو',
    archives: 'الملفات المضغوطة', data: 'تحويل البيانات'
  };
  return names[category] || category;
}

// ===================== CONTENT GENERATION (Arabic) =====================

function arTitle(from, to) {
  const f = af(from); const t = af(to);
  return `تحويل ${from.toUpperCase()} الى ${to.toUpperCase()} اون لاين مجاناً — محول ${BRAND}`;
}

function arDescription(from, to) {
  const f = af(from); const t = af(to);
  return `حوّل ${f.fullName} (${from.toUpperCase()}) إلى ${t.fullName} (${to.toUpperCase()}) مجاناً أونلاين. بدون تسجيل، بدون علامات مائية، خصوصية تامة. تحويل متعدد مع جودة قابلة للتعديل.`;
}

function arIntro(from, to) {
  const f = af(from); const t = af(to);
  return `هل تريد تحويل ${f.fullName} (${from.toUpperCase()}) إلى ${t.fullName} (${to.toUpperCase()})؟ ${BRAND} هو محول مجاني أونلاين يعمل بالكامل في متصفحك. لا يتم رفع أي ملفات إلى خوادمنا — خصوصيتك مضمونة ١٠٠٪. سواء كنت بحاجة لتحويل ملف واحد أو معالجة مجموعة كاملة، أداتنا تدعم كل ذلك بدون تسجيل أو حدود.`;
}

function arSteps(from, to) {
  return [
    `ارفع ملف ${from.toUpperCase()} الخاص بك — اضغط "اختيار ملفات" أو اسحب الملف إلى منطقة الرفع`,
    `اختر ${to.toUpperCase()} كصيغة الإخراج — واضبط الجودة من شريط التمرير (٩٠٪ هي الأفضل)`,
    `اضغط "تحويل الكل" وحمّل ملفات ${to.toUpperCase()} المحولة — بشكل فردي أو كملف ZIP`,
  ];
}

function arWhy() {
  return [
    { icon: '🆓', title: 'مجاني ١٠٠٪', desc: 'بدون رسوم خفية، بدون اشتراكات، بدون بطاقة ائتمان. التحويل مجاني للأبد.' },
    { icon: '🔒', title: 'خصوصية تامة', desc: 'كل المعالجة تتم في متصفحك. ملفاتك لا تغادر جهازك أبداً.' },
    { icon: '📦', title: 'معالجة متعددة', desc: 'حوّل عدة ملفات في وقت واحد بمجرد ضغطة زر.' },
    { icon: '⚡', title: 'سريع جداً', desc: 'محركات تحويل محسّنة لأسرع معالجة ممكنة. النتائج في ثوانٍ.' },
    { icon: '📱', title: 'يعمل في كل مكان', desc: 'متوافق مع جميع الأجهزة — حاسوب، لوحي، وجوال.' },
    { icon: '🎯', title: 'جودة عالية', desc: 'إعدادات جودة قابلة للتعديل للحصول على أفضل توازن بين الحجم والجودة.' },
  ];
}

function arFAQ(from, to) {
  const f = af(from); const t = af(to);
  return [
    { q: `هل تحويل ${from.toUpperCase()} إلى ${to.toUpperCase()} مجاني؟`, a: `نعم، ${BRAND} مجاني ١٠٠٪. لا توجد رسوم خفية أو اشتراكات مدفوعة. يمكنك تحويل عدد غير محدود من الملفات.` },
    { q: `هل يمكنني تحويل عدة ملفات ${from.toUpperCase()} في وقت واحد؟`, a: `نعم. ${BRAND} يدعم المعالجة المتعددة. ارفع عدة ملفات وحوّلها كلها إلى ${to.toUpperCase()} بنقرة واحدة.` },
    { q: `هل بياناتي آمنة عند استخدام ${BRAND}؟`, a: `نعم. ${BRAND} يعالج الملفات بالكامل في متصفحك. ملفاتك لا تغادر جهازك أبداً، مما يضمن خصوصية وأمان كاملين.` },
    { q: `هل أحتاج للتسجيل أو إنشاء حساب؟`, a: `لا. ${BRAND} مجاني بالكامل ولا يتطلب أي تسجيل. فقط ارفع ملفاتك وحوّلها فوراً.` },
    { q: `هل توجد علامات مائية على الملفات المحولة؟`, a: `لا. ملفاتك المحولة نظيفة تماماً بدون أي علامات مائية.` },
    { q: `ما هو الحد الأقصى لحجم الملف؟`, a: `بما أن المعالجة تتم في متصفحك، يعتمد الحد الأقصى على ذاكرة جهازك. معظم المتصفحات الحديثة تتعامل مع ملفات حتى ٥٠٠ ميجابايت.` },
  ];
}

function arRelated(from, to, category) {
  const sameCat = PRIORITY_PAGES.filter(p => p.category === category && !(p.from === from && p.to === to));
  const reverse = sameCat.find(p => p.from === to && p.to === from);
  const others = sameCat.filter(p => !(p.from === to && p.to === from)).slice(0, 7);
  const result = [];
  if (reverse) result.push(reverse);
  result.push(...others.slice(0, 8));
  return result;
}

// ===================== PAGE HTML GENERATOR (Arabic RTL) =====================

function generateArabicPage(from, to, pageDef) {
  const f = af(from); const t = af(to);
  const slug = arSlug(from, to);
  const category = pageDef.category;
  const fullEnUrl = `${SITE_URL}/${from}-to-${to}/`;
  const fullArUrl = `${SITE_URL}/ar/تحويل/${slug}/`;
  const pageDir = path.join(ARABIC_DIR, slug);

  const title = arTitle(from, to);
  const metaDesc = arDescription(from, to);
  const intro = arIntro(from, to);
  const steps = arSteps(from, to);
  const whys = arWhy();
  const faqs = arFAQ(from, to);
  const related = arRelated(from, to, category);

  // FAQ JSON-LD
  const faqSchema = faqs.map(faq => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a }
  }));

  // Breadcrumb
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${SITE_URL}/ar/` },
    { '@type': 'ListItem', position: 2, name: arCatName(category), item: `${SITE_URL}/ar/تحويل/` },
    { '@type': 'ListItem', position: 3, name: `تحويل ${from.toUpperCase()} إلى ${to.toUpperCase()}`, item: fullArUrl },
  ];

  // Related tools HTML
  const relatedHtml = related.map(r => {
    const rSlug = arSlug(r.from, r.to);
    return `<li><a href="${SITE_URL}/ar/تحويل/${rSlug}/" title="تحويل ${r.from.toUpperCase()} إلى ${r.to.toUpperCase()}">تحويل ${r.from.toUpperCase()} إلى ${r.to.toUpperCase()}</a></li>`;
  }).join('\n            ');

  // Steps HTML
  const stepsHtml = steps.map((s, i) => `
      <div class="step-card">
        <div class="step-number">${i + 1}</div>
        <p>${s}</p>
      </div>`).join('\n        ');

  // Why us HTML
  const whyHtml = whys.map(w => `
      <div class="why-card">
        <div class="why-icon">${w.icon}</div>
        <h3>${w.title}</h3>
        <p>${w.desc}</p>
      </div>`).join('\n        ');

  // FAQ HTML
  const faqHtml = faqs.map((faq, i) => `
      <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">${faq.q}</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <div itemprop="text"><p>${faq.a}</p></div>
        </div>
      </div>`).join('\n        ');

  return `<!DOCTYPE html>
<html lang="ar" data-theme="dark" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>${title}</title>
  <meta name="description" content="${metaDesc}">
  <meta name="keywords" content="تحويل ${from} الى ${to}, محول ${from} الى ${to}, تحويل ${from} إلى ${to} مجانا, ${from} ${to} اون لاين">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <meta name="author" content="${BRAND}">

  <link rel="canonical" href="${fullArUrl}">

  <!-- Bilingual hreflang -->
  <link rel="alternate" hreflang="en" href="${fullEnUrl}" />
  <link rel="alternate" hreflang="ar" href="${fullArUrl}" />
  <link rel="alternate" hreflang="x-default" href="${fullEnUrl}" />

  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="${fullArUrl}">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:locale" content="ar_AR">
  <meta property="og:image" content="${SITE_URL}/assets/logo.png">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${metaDesc}">

  <!-- JSON-LD: SoftwareApplication -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "${BRAND} — تحويل ${from.toUpperCase()} إلى ${to.toUpperCase()}",
    "operatingSystem": "الكل (قائم على المتصفح)",
    "applicationCategory": "Multimedia",
    "description": "${metaDesc}",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "author": { "@type": "Organization", "name": "${BRAND}", "url": "${SITE_URL}/" },
    "inLanguage": "ar"
  }
  </script>

  <!-- JSON-LD: FAQPage -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": ${JSON.stringify(faqSchema, null, 2)}
  }
  </script>

  <!-- JSON-LD: BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": ${JSON.stringify(breadcrumbItems)}
  }
  </script>

  <!-- JSON-LD: Organization -->
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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Tajawal', 'Noto Sans Arabic', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0F1923; color: #E6EDF5; line-height: 1.8;
      direction: rtl; text-align: right;
    }
    .container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
    a { color: #2AD4C0; text-decoration: none; }
    a:hover { color: #FF5E2C; }

    .header { background: #0F1923; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 0; position: sticky; top: 0; z-index: 100; }
    .header-inner { max-width: 1140px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo-text { font-size: 1.25rem; font-weight: 700; background: linear-gradient(135deg, #FF5E2C, #2AD4C0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-links { display: flex; gap: 6px; flex-wrap: wrap; }
    .nav-links a { color: #A0B4C8; padding: 8px 14px; border-radius: 8px; font-size: 0.875rem; font-weight: 500; transition: 0.3s; }
    .nav-links a:hover { color: #E6EDF5; background: rgba(255,255,255,0.05); }

    .hero { text-align: center; padding: 60px 0 40px; }
    .hero h1 { font-size: 2.75rem; font-weight: 800; line-height: 1.3; margin-bottom: 16px; background: linear-gradient(135deg, #FF5E2C, #2AD4C0, #F7C948); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 1.125rem; color: #A0B4C8; max-width: 680px; margin: 0 auto; }

    .converter-embed { background: rgba(26,44,62,0.5); border-radius: 16px; padding: 40px; margin: 40px 0; text-align: center; border: 1px solid rgba(255,255,255,0.08); }
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #FF5E2C, #2AD4C0); color: #fff; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 1rem; border: none; cursor: pointer; transition: 0.3s; text-decoration: none; }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); color: #fff; }
    .section { padding: 48px 0; }
    .section h2 { font-size: 2rem; font-weight: 700; margin-bottom: 24px; }
    .section h2 .hl { background: linear-gradient(135deg, #FF5E2C, #2AD4C0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    .breadcrumb { padding: 16px 0; font-size: 0.8125rem; color: #6B8BA8; }
    .breadcrumb a { color: #6B8BA8; }
    .breadcrumb a:hover { color: #2AD4C0; }
    .breadcrumb span { margin: 0 6px; }

    .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 32px; }
    .step-card { background: rgba(26,44,62,0.5); border-radius: 12px; padding: 28px; border: 1px solid rgba(255,255,255,0.06); text-align: center; transition: 0.3s; }
    .step-card:hover { border-color: #FF5E2C; transform: translateY(-2px); }
    .step-number { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #FF5E2C, #2AD4C0); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; margin: 0 auto 16px; color: #fff; }
    .step-card p { color: #A0B4C8; font-size: 0.9375rem; }

    .why-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 32px; }
    .why-card { background: rgba(26,44,62,0.5); border-radius: 12px; padding: 28px; border: 1px solid rgba(255,255,255,0.06); text-align: center; }
    .why-icon { font-size: 2rem; margin-bottom: 12px; }
    .why-card h3 { font-size: 1.125rem; margin-bottom: 8px; }
    .why-card p { color: #A0B4C8; font-size: 0.9375rem; }

    .faq-list { display: flex; flex-direction: column; gap: 8px; margin-top: 32px; }
    .faq-item { background: rgba(26,44,62,0.5); border-radius: 12px; padding: 24px; border: 1px solid rgba(255,255,255,0.06); }
    .faq-item h3 { font-size: 1.0625rem; font-weight: 600; margin-bottom: 8px; color: #2AD4C0; cursor: pointer; }
    .faq-item h3:hover { color: #FF5E2C; }
    .faq-item p { color: #A0B4C8; font-size: 0.9375rem; }

    .comparison-section { background: rgba(26,44,62,0.5); border-radius: 16px; padding: 32px; margin-top: 32px; }
    .comparison-section table { width: 100%; border-collapse: collapse; }
    .comparison-section th, .comparison-section td { padding: 12px 16px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .comparison-section th { font-weight: 600; color: #E6EDF5; }
    .comparison-section td { color: #A0B4C8; }

    .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 32px; }
    .related-grid a { background: rgba(26,44,62,0.5); border-radius: 10px; padding: 14px 18px; border: 1px solid rgba(255,255,255,0.06); font-size: 0.875rem; font-weight: 500; transition: 0.2s; color: #A0B4C8; display: block; text-align: center; }
    .related-grid a:hover { border-color: #2AD4C0; color: #E6EDF5; }

    .footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 32px 0; text-align: center; color: #6B8BA8; font-size: 0.8125rem; }
    .footer a { color: #A0B4C8; }
    .footer a:hover { color: #2AD4C0; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 1.75rem; }
      .section h2 { font-size: 1.5rem; }
      .steps-grid { grid-template-columns: 1fr; }
      .why-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <a href="${SITE_URL}/ar/" class="logo">
        <span class="logo-text">${BRAND} — محول الملفات</span>
      </a>
      <nav class="nav-links">
        <a href="${SITE_URL}/ar/تحويل/">📁 جميع الأدوات</a>
        <a href="${fullEnUrl}" hreflang="en">English</a>
      </nav>
    </div>
  </header>

  <div class="container">
    <nav class="breadcrumb">
      <a href="${SITE_URL}/ar/">الرئيسية</a>
      <span>›</span>
      <a href="${SITE_URL}/ar/تحويل/">تحويل</a>
      <span>›</span>
      <span>تحويل ${from.toUpperCase()} إلى ${to.toUpperCase()}</span>
    </nav>

    <section class="hero">
      <h1>تحويل ${from.toUpperCase()} إلى ${to.toUpperCase()} — مجاناً أونلاين</h1>
      <p>محول ${from.toUpperCase()} إلى ${to.toUpperCase()} مجاني وسريع وآمن. بدون تسجيل، بدون رفع للخوادم، بدون علامات مائية.</p>
    </section>

    <section class="converter-embed">
      <h2 style="margin-bottom:16px;font-size:1.5rem;">محول ${from.toUpperCase()} إلى ${to.toUpperCase()}</h2>
      <p style="margin-bottom:24px;color:#A0B4C8;">ارفع ملفك وحوّله فوراً</p>
      <a href="${SITE_URL}/" class="btn-primary">🚀 فتح المحول</a>
      <p style="margin-top:16px;color:#6B8BA8;font-size:0.875rem;">⚡ كل المعالجة في متصفحك — ملفاتك تبقى خاصة</p>
    </section>

    <section class="section">
      <p style="font-size:1.0625rem;color:#A0B4C8;line-height:1.7;">${intro}</p>
    </section>

    <section class="section">
      <h2>كيفية تحويل <span class="hl">${from.toUpperCase()} إلى ${to.toUpperCase()}</span></h2>
      <div class="steps-grid">
        ${stepsHtml}
      </div>
    </section>

    <section class="section">
      <h2>لماذا <span class="hl">${BRAND}</span> لتحويل ${from.toUpperCase()} إلى ${to.toUpperCase()}؟</h2>
      <div class="why-grid">
        ${whyHtml}
      </div>
    </section>

    <section class="section">
      <h2>الفرق بين ${from.toUpperCase()} و ${to.toUpperCase()}</h2>
      <div class="comparison-section">
        <table>
          <thead>
            <tr><th>الميزة</th><th>${from.toUpperCase()}</th><th>${to.toUpperCase()}</th></tr>
          </thead>
          <tbody>
            <tr><td>الاسم الكامل</td><td>${f.fullName}</td><td>${t.fullName}</td></tr>
            <tr><td>نوع الضغط</td><td>${f.desc}</td><td>${t.desc}</td></tr>
            <tr><td>الاستخدام الأفضل</td><td>معالجة الصور والحفاظ على الجودة</td><td>المشاركة والنشر على الويب</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section" itemscope itemtype="https://schema.org/FAQPage">
      <h2>الأسئلة الشائعة</h2>
      <div class="faq-list">
        ${faqHtml}
      </div>
    </section>

    <!-- Related Tools -->
    <section class="section">
      <h2>أدوات تحويل ذات صلة</h2>
      <div class="related-grid">
        <a href="${SITE_URL}/ar/تحويل/">📁 جميع أدوات التحويل</a>
        ${relatedHtml}
      </div>
    </section>
  </div>

  <footer class="footer">
    <div class="container">
      <p>© ${new Date().getFullYear()} <a href="${SITE_URL}/ar/">${BRAND}</a> — محول ملفات مجاني أونلاين. تحويل الصور، PDF، المستندات، الصوت، الفيديو والمزيد.</p>
      <p style="margin-top:8px;">
        <a href="${SITE_URL}/ar/">الرئيسية</a> &middot;
        <a href="${fullEnUrl}">English Version</a>
      </p>
    </div>
  </footer>
</body>
</html>`;
}

// ===================== ARABIC HOMEPAGE =====================
function generateArabicHomepage() {
  const categories = [...new Set(PRIORITY_PAGES.map(p => p.category))];
  
  return `<!DOCTYPE html>
<html lang="ar" data-theme="dark" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>محول صور وملفات مجاني أونلاين — ${BRAND}</title>
  <meta name="description" content="محول صور وملفات مجاني أونلاين. حول PNG إلى JPG، PDF إلى Word، MP4 إلى MP3 والمزيد. بدون تسجيل، بدون رفع للخوادم، مجاني ١٠٠٪.">
  <link rel="canonical" href="${SITE_URL}/ar/">
  <link rel="alternate" hreflang="en" href="${SITE_URL}/" />
  <link rel="alternate" hreflang="ar" href="${SITE_URL}/ar/" />
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />
  <meta property="og:title" content="محول صور وملفات مجاني أونلاين">
  <meta property="og:locale" content="ar_AR">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Tajawal', 'Noto Sans Arabic', sans-serif; background: #0F1923; color: #E6EDF5; line-height: 1.8; direction: rtl; text-align: right; }
    .container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
    a { color: #2AD4C0; text-decoration: none; }
    .header { background: #0F1923; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 0; }
    .header-inner { max-width: 1140px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
    .logo-text { font-size: 1.25rem; font-weight: 700; background: linear-gradient(135deg, #FF5E2C, #2AD4C0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero { text-align: center; padding: 80px 0 48px; }
    .hero h1 { font-size: 2.75rem; font-weight: 800; background: linear-gradient(135deg, #FF5E2C, #2AD4C0, #F7C948); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { color: #A0B4C8; font-size: 1.125rem; max-width: 600px; margin: 16px auto 0; }
    .sections { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; padding: 40px 0; }
    .tool-group { background: rgba(26,44,62,0.5); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.06); }
    .tool-group h3 { font-size: 1.125rem; margin-bottom: 12px; }
    .tool-group ul { list-style: none; }
    .tool-group li { margin-bottom: 6px; }
    .tool-group li a { color: #A0B4C8; font-size: 0.875rem; }
    .tool-group li a:hover { color: #2AD4C0; }
    .footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 32px 0; text-align: center; color: #6B8BA8; font-size: 0.8125rem; }
    @media (max-width: 768px) { .hero h1 { font-size: 1.75rem; } }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <span class="logo-text">${BRAND} — محول الملفات</span>
      <nav><a href="${SITE_URL}/" hreflang="en">English</a></nav>
    </div>
  </header>
  <div class="container">
    <section class="hero">
      <h1>محول صور وملفات مجاني أونلاين</h1>
      <p>حوّل الصور، PDF، المستندات، الصوت، الفيديو والمزيد. مجاني ١٠٠٪، بدون تسجيل، بدون رفع للخوادم.</p>
    </section>
    <div class="sections">
      <div class="tool-group">
        <h3>🖼️ تحويل الصور</h3>
        <ul>
          <li><a href="${SITE_URL}/ar/تحويل/png-الى-jpg/">تحويل PNG إلى JPG</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/jpg-الى-png/">تحويل JPG إلى PNG</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/webp-الى-png/">تحويل WEBP إلى PNG</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/heic-الى-jpg/">تحويل HEIC إلى JPG</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/svg-الى-png/">تحويل SVG إلى PNG</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/jpg-الى-pdf/">تحويل JPG إلى PDF</a></li>
        </ul>
      </div>
      <div class="tool-group">
        <h3>📄 تحويل PDF</h3>
        <ul>
          <li><a href="${SITE_URL}/ar/تحويل/pdf-الى-docx/">تحويل PDF إلى Word</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/docx-الى-pdf/">تحويل Word إلى PDF</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/pdf-الى-jpg/">تحويل PDF إلى JPG</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/jpg-الى-pdf/">تحويل الصور إلى PDF</a></li>
        </ul>
      </div>
      <div class="tool-group">
        <h3>🎵 تحويل الصوت والفيديو</h3>
        <ul>
          <li><a href="${SITE_URL}/ar/تحويل/mp4-الى-mp3/">تحويل MP4 إلى MP3</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/mov-الى-mp4/">تحويل MOV إلى MP4</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/mkv-الى-mp4/">تحويل MKV إلى MP4</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/avi-الى-mp4/">تحويل AVI إلى MP4</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/mp3-الى-wav/">تحويل MP3 إلى WAV</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/flac-الى-mp3/">تحويل FLAC إلى MP3</a></li>
        </ul>
      </div>
      <div class="tool-group">
        <h3>📦 أدوات أخرى</h3>
        <ul>
          <li><a href="${SITE_URL}/ar/تحويل/rar-الى-zip/">تحويل RAR إلى ZIP</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/json-الى-xml/">تحويل JSON إلى XML</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/xml-الى-json/">تحويل XML إلى JSON</a></li>
          <li><a href="${SITE_URL}/ar/تحويل/json-الى-csv/">تحويل JSON إلى CSV</a></li>
        </ul>
      </div>
    </div>
  </div>
  <footer class="footer">
    <p>© ${new Date().getFullYear()} <a href="${SITE_URL}/ar/">${BRAND}</a> — محول ملفات مجاني أونلاين</p>
  </footer>
</body>
</html>`;
}

// ===================== MAIN =====================
function main() {
  console.log('🌐 PixelForge Arabic SEO Page Generator');
  console.log(`📁 Output: ${ARABIC_DIR}`);
  console.log(`📄 Arabic pages to generate: ${PRIORITY_PAGES.length}\n`);

  // Create directories
  if (!fs.existsSync(ARABIC_DIR)) fs.mkdirSync(ARABIC_DIR, { recursive: true });

  // Generate Arabic homepage
  const arHomeHtml = generateArabicHomepage();
  fs.writeFileSync(path.join(ENGLISH_DIR, 'ar', 'index.html'), arHomeHtml, 'utf8');
  console.log(`  ✅ Arabic homepage: /ar/`);

  // Generate Arabic category index
  const arCatHtml = generateArabicHomepage();
  fs.writeFileSync(path.join(ARABIC_DIR, 'index.html'), arCatHtml, 'utf8');
  
  // Generate individual Arabic tool pages
  for (const page of PRIORITY_PAGES) {
    const { from, to } = page;
    const slug = arSlug(from, to);
    const pageDir = path.join(ARABIC_DIR, slug);
    
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
    
    const html = generateArabicPage(from, to, page);
    const pagePath = path.join(pageDir, 'index.html');
    fs.writeFileSync(pagePath, html, 'utf8');
    console.log(`  ✅ Generated: /ar/تحويل/${slug}/ (تحويل ${from.toUpperCase()} → ${to.toUpperCase()}) [${page.traffic}]`);
  }

  console.log(`\n🎉 Done! ${PRIORITY_PAGES.length + 2} Arabic pages generated.`);
  console.log(`\n⚠️ NEXT STEP: Update hreflang on all English pages to point to Arabic counterparts.`);
}

main();
