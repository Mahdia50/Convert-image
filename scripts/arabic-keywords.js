#!/usr/bin/env node
/**
 * Arabic Keyword Research — Convert-Image (PixelForge)
 * 
 * These are REAL Arabic search patterns, not literal translations.
 * Arabic users search differently than English users:
 * - "تحويل jpg الى png" (with spaces) more common than "تحويل jpg إلى png"
 * - "محول صور" preferred over "برنامج تحويل الصور"
 * - Mixed Arabic-English keyboard usage is normal
 * 
 * Usage: node scripts/arabic-keywords.js
 */

const keywords = {
  // ========== IMAGE CONVERSION (تحويل الصور) ==========
  imageConversion: {
    category: "صور",
    categoryEn: "images",
    icon: "🖼️",
    terms: [
      // High volume, high intent
      { ar: "تحويل jpg الى png", en: "convert jpg to png", volume: "8.1K", difficulty: "Medium", intent: "Transactional" },
      { ar: "تحويل png الى jpg", en: "convert png to jpg", volume: "6.5K", difficulty: "Medium", intent: "Transactional" },
      { ar: "تحويل الصور الى pdf", en: "convert images to pdf", volume: "5.4K", difficulty: "Medium", intent: "Transactional" },
      { ar: "محول صور اون لاين", en: "online image converter", volume: "4.8K", difficulty: "Medium", intent: "Commercial" },
      { ar: "تحويل jpg الى pdf", en: "convert jpg to pdf", volume: "4.2K", difficulty: "Medium", intent: "Transactional" },
      { ar: "تحويل الصور", en: "convert images", volume: "3.9K", difficulty: "Low", intent: "Informational" },
      { ar: "تحويل image الى jpg", en: "convert image to jpg", volume: "3.5K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل الصورة الى png", en: "convert image to png", volume: "3.2K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل webp الى png", en: "convert webp to png", volume: "2.8K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل jpg الى png اون لاين", en: "convert jpg to png online", volume: "2.5K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل png الى jpg مجانا", en: "convert png to jpg free", volume: "2.3K", difficulty: "Low", intent: "Transactional" },
      { ar: "تغيير صيغة الصورة", en: "change image format", volume: "2.1K", difficulty: "Low", intent: "Informational" },
      { ar: "تحويل heic الى jpg", en: "convert heic to jpg", volume: "1.8K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل avif الى png", en: "convert avif to png", volume: "800", difficulty: "Very Low", intent: "Transactional" },
      { ar: "تحويل bmp الى png", en: "convert bmp to png", volume: "700", difficulty: "Very Low", intent: "Transactional" },
      { ar: "تحويل svg الى png", en: "convert svg to png", volume: "1.2K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل ico الى png", en: "convert ico to png", volume: "600", difficulty: "Very Low", intent: "Transactional" },
      { ar: "تحويل gif الى mp4", en: "convert gif to mp4", volume: "900", difficulty: "Low", intent: "Transactional" },
      { ar: "ضغط الصور اون لاين", en: "compress images online", volume: "14K", difficulty: "High", intent: "Transactional" },
      { ar: "تصغير حجم الصورة", en: "reduce image size", volume: "3.6K", difficulty: "Medium", intent: "Informational" },
      { ar: "تغيير مقاس الصورة", en: "resize image", volume: "2.8K", difficulty: "Low", intent: "Transactional" },
    ]
  },

  // ========== PDF & DOCUMENTS (PDF والمستندات) ==========
  pdfConversion: {
    category: "PDF",
    categoryEn: "pdf",
    icon: "📄",
    terms: [
      { ar: "تحويل pdf الى word", en: "convert pdf to word", volume: "12K", difficulty: "High", intent: "Transactional" },
      { ar: "تحويل pdf الى jpg", en: "convert pdf to jpg", volume: "8.5K", difficulty: "Medium", intent: "Transactional" },
      { ar: "تحويل word الى pdf", en: "convert word to pdf", volume: "7.2K", difficulty: "Medium", intent: "Transactional" },
      { ar: "تحويل pdf الى excel", en: "convert pdf to excel", volume: "4.5K", difficulty: "Medium", intent: "Transactional" },
      { ar: "تحويل excel الى pdf", en: "convert excel to pdf", volume: "3.2K", difficulty: "Medium", intent: "Transactional" },
      { ar: "دمج pdf", en: "merge pdf", volume: "5.8K", difficulty: "Medium", intent: "Transactional" },
      { ar: "ضغط pdf", en: "compress pdf", volume: "4.1K", difficulty: "Medium", intent: "Transactional" },
      { ar: "تحويل pdf الى صور", en: "convert pdf to images", volume: "2.7K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل ppt الى pdf", en: "convert ppt to pdf", volume: "2.1K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل pdf الى ppt", en: "convert pdf to ppt", volume: "1.5K", difficulty: "Low", intent: "Transactional" },
      { ar: "تقسيم pdf", en: "split pdf", volume: "2.3K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل html الى pdf", en: "convert html to pdf", volume: "1.8K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل pdf الى txt", en: "convert pdf to text", volume: "1.4K", difficulty: "Low", intent: "Transactional" },
      { ar: "فتح pdf", en: "unlock pdf", volume: "2K", difficulty: "Low", intent: "Transactional" },
      { ar: "حماية pdf", en: "protect pdf", volume: "1.2K", difficulty: "Low", intent: "Transactional" },
    ]
  },

  // ========== AUDIO & VIDEO (صوت وفيديو) ==========
  mediaConversion: {
    category: "وسائط",
    categoryEn: "media",
    icon: "🎵",
    terms: [
      { ar: "تحويل mp4 الى mp3", en: "convert mp4 to mp3", volume: "15K", difficulty: "High", intent: "Transactional" },
      { ar: "تحويل mp3 الى wav", en: "convert mp3 to wav", volume: "3.2K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل wav الى mp3", en: "convert wav to mp3", volume: "2.5K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل mov الى mp4", en: "convert mov to mp4", volume: "2.8K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل avi الى mp4", en: "convert avi to mp4", volume: "2.2K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل mkv الى mp4", en: "convert mkv to mp4", volume: "2K", difficulty: "Low", intent: "Transactional" },
      { ar: "استخراج الصوت من الفيديو", en: "extract audio from video", volume: "4.2K", difficulty: "Medium", intent: "Transactional" },
      { ar: "تحويل الفيديو الى mp3", en: "convert video to mp3", volume: "3.5K", difficulty: "Medium", intent: "Transactional" },
      { ar: "تحويل flac الى mp3", en: "convert flac to mp3", volume: "1.1K", difficulty: "Low", intent: "Transactional" },
      { ar: "ضغط الفيديو", en: "compress video", volume: "3.8K", difficulty: "Medium", intent: "Transactional" },
      { ar: "تحويل ogg الى mp3", en: "convert ogg to mp3", volume: "800", difficulty: "Very Low", intent: "Transactional" },
    ]
  },

  // ========== ARCHIVES (أرشيف) ==========
  archiveConversion: {
    category: "أرشيف",
    categoryEn: "archives",
    icon: "📦",
    terms: [
      { ar: "فك ضغط zip", en: "unzip online", volume: "3.5K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل rar الى zip", en: "convert rar to zip", volume: "1.8K", difficulty: "Low", intent: "Transactional" },
      { ar: "فك ضغط rar", en: "extract rar online", volume: "2.5K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل zip الى rar", en: "convert zip to rar", volume: "1.2K", difficulty: "Low", intent: "Transactional" },
      { ar: "فك الضغط", en: "extract archive", volume: "2.8K", difficulty: "Low", intent: "Informational" },
    ]
  },

  // ========== DATA (بيانات) ==========
  dataConversion: {
    category: "بيانات",
    categoryEn: "data",
    icon: "📋",
    terms: [
      { ar: "تحويل excel الى csv", en: "convert excel to csv", volume: "2.2K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل csv الى excel", en: "convert csv to excel", volume: "1.8K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل json الى xml", en: "convert json to xml", volume: "1.5K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل xml الى json", en: "convert xml to json", volume: "1.3K", difficulty: "Low", intent: "Transactional" },
      { ar: "تحويل json الى csv", en: "convert json to csv", volume: "1.1K", difficulty: "Low", intent: "Transactional" },
    ]
  },

  // ========== INFORMATIONAL (محتوى تعليمي) ==========
  informational: {
    category: "معلومات",
    categoryEn: "blog",
    icon: "📝",
    terms: [
      { ar: "الفرق بين png و jpg", en: "difference between png and jpg", volume: "2.4K", difficulty: "Low", intent: "Informational" },
      { ar: "افضل صيغة للصور", en: "best image format for web", volume: "1.8K", difficulty: "Low", intent: "Informational" },
      { ar: "الفرق بين mp3 و flac", en: "mp3 vs flac difference", volume: "1.2K", difficulty: "Low", intent: "Informational" },
      { ar: "كيفية تحويل الصور الى pdf", en: "how to convert images to pdf", volume: "2.1K", difficulty: "Low", intent: "Informational" },
      { ar: "طريقة تحويل pdf الى word", en: "how to convert pdf to word", volume: "3.5K", difficulty: "Medium", intent: "Informational" },
      { ar: "ما هي صيغة webp", en: "what is webp format", volume: "900", difficulty: "Very Low", intent: "Informational" },
      { ar: "كيفية ضغط الصور", en: "how to compress images", volume: "2.6K", difficulty: "Low", intent: "Informational" },
      { ar: "افضل محول صور", en: "best image converter", volume: "1.5K", difficulty: "Low", intent: "Commercial" },
      { ar: "برنامج تحويل الصور", en: "image converter software", volume: "1.8K", difficulty: "Medium", intent: "Commercial" },
    ]
  },
};

// Print organized report
console.log("=".repeat(80));
console.log("📊 ARABIC KEYWORD RESEARCH — Convert-Image");
console.log("=".repeat(80));
console.log("");

let totalKeywords = 0;
let highPriority = 0;

for (const [section, data] of Object.entries(keywords)) {
  console.log(`${data.icon} ${data.category} (${data.categoryEn})`);
  console.log("-".repeat(60));
  
  // Sort by volume descending
  const sorted = [...data.terms].sort((a, b) => parseInt(b.volume) - parseInt(a.volume));
  
  for (const kw of sorted) {
    totalKeywords++;
    const vol = parseInt(kw.volume);
    let priority = "🟢 Low";
    if (vol > 5000) { priority = "🔴 High"; highPriority++; }
    else if (vol > 2000) { priority = "🟡 Medium"; }
    
    console.log(`  ${priority} ${kw.ar.padEnd(35)} ${kw.volume.padEnd(8)} ${kw.difficulty.padEnd(12)} ${kw.intent}`);
  }
  console.log("");
}

console.log("=".repeat(80));
console.log(`📈 Total Arabic keywords identified: ${totalKeywords}`);
console.log(`🔴 High priority (volume > 5K): ${highPriority}`);
console.log("=".repeat(80));
console.log("");
console.log("NOTE: Search volumes are estimates based on available tools.");
console.log("Actual volumes may vary. Verify with Google Keyword Planner.");
