/* =============================================
   PixelForge - Image Conversion Engine
   Client-side conversion using Canvas API
   ============================================= */

const Converter = (() => {
  // Supported output formats and their MIME types
  const FORMATS = {
    png:  { mime: 'image/png',  ext: '.png',  lossy: false },
    jpeg: { mime: 'image/jpeg', ext: '.jpg',  lossy: true  },
    webp: { mime: 'image/webp', ext: '.webp', lossy: true  },
    gif:  { mime: 'image/gif',  ext: '.gif',  lossy: false },
    bmp:  { mime: 'image/bmp',  ext: '.bmp',  lossy: false },
    avif: { mime: 'image/avif', ext: '.avif', lossy: true  },
    tiff: { mime: 'image/tiff', ext: '.tiff', lossy: false },
  };

  // Check runtime format support
  function checkFormatSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return {};

    const support = {};
    for (const [fmt, info] of Object.entries(FORMATS)) {
      try {
        const blob = canvas.toDataURL(info.mime);
        support[fmt] = blob.startsWith('data:image');
      } catch {
        support[fmt] = false;
      }
    }
    return support;
  }

  // Load an image file into an HTMLImageElement
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({ img, dataUrl: e.target.result });
        };
        img.onerror = () => reject(new Error(`Failed to decode: ${file.name}`));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error(`Failed to read: ${file.name}`));
      reader.readAsDataURL(file);
    });
  }

  // Convert a single image with options
  async function convertImage(file, options = {}) {
    const {
      format = 'png',
      quality = 90,
      maxWidth = null,
      maxHeight = null,
      maintainAspect = true,
      rotate = 0,
      flipH = false,
      flipV = false,
    } = options;

    const formatInfo = FORMATS[format];
    if (!formatInfo) throw new Error(`Unsupported format: ${format}`);

    const { img } = await loadImage(file);

    // Determine output dimensions
    let width = img.naturalWidth;
    let height = img.naturalHeight;

    // Apply resize if specified
    if (maxWidth || maxHeight) {
      if (maxWidth && maxHeight && maintainAspect) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      } else if (maxWidth) {
        if (maintainAspect) {
          height = Math.round(height * (maxWidth / width));
        }
        width = maxWidth;
      } else if (maxHeight) {
        if (maintainAspect) {
          width = Math.round(width * (maxHeight / height));
        }
        height = maxHeight;
      }
    }

    // Create canvas and draw
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Apply transforms
    ctx.save();
    // Translate to center for rotation
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    if (flipH) ctx.scale(-1, 1);
    if (flipV) ctx.scale(1, -1);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
    ctx.restore();

    // Convert to blob
    const qualityNorm = quality / 100;
    const mimeType = formatInfo.mime;

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error(`Canvas toBlob failed for format: ${format}`));
          return;
        }

        // Generate output filename
        const originalName = file.name.replace(/\.[^.]+$/, '');
        const outputName = `${originalName}${formatInfo.ext}`;

        resolve({
          blob,
          name: outputName,
          format,
          width,
          height,
          size: blob.size,
          url: URL.createObjectURL(blob),
        });
      }, mimeType, qualityNorm);
    });
  }

  // Batch convert all files
  async function batchConvert(files, options = {}, onProgress = null) {
    const results = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
      try {
        const result = await convertImage(files[i], options);
        results.push({ success: true, file: files[i].name, result });
      } catch (err) {
        results.push({ success: false, file: files[i].name, error: err.message });
      }
      if (onProgress) onProgress(i + 1, total);
    }

    return results;
  }

  // Download a single result blob
  function downloadResult(result) {
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Download all results as individual files (triggered sequentially)
  function downloadAll(results) {
    results.filter(r => r.success).forEach(r => downloadResult(r.result));
  }

  // Format file size for display
  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  // Get file extension from name
  function getFileExtension(filename) {
    const match = filename.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : '';
  }

  return {
    FORMATS,
    checkFormatSupport,
    loadImage,
    convertImage,
    batchConvert,
    downloadResult,
    downloadAll,
    formatFileSize,
    getFileExtension,
  };
})();
