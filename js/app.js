/* =============================================
   PixelForge - Main Application Controller
   ============================================= */

(function () {
  'use strict';

  // ===== State =====
  const state = {
    files: [],
    results: [],
    currentFormat: 'png',
    quality: 90,
    isConverting: false,
    editorImage: null,  // Current image being edited
    selectedTool: 'resize',
    theme: localStorage.getItem('pixelforge_theme') || 'dark',
  };

  // DOM references
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ===== Initialization =====
  async function init() {
    // Init i18n
    await I18n.init();
    I18n.onChange(() => { /* UI already updated by i18n */ });

    // Apply saved theme
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeUI();

    // Check format support
    const support = Converter.checkFormatSupport();
    console.log('Format support:', Object.entries(support).filter(([,v]) => v).map(([k]) => k));

    // Setup all event listeners
    setupNavigation();
    setupUpload();
    setupFormatSelector();
    setupQualitySlider();
    setupConversion();
    setupResults();
    setupEditor();
    setupSettings();
    setupThemeToggle();
    setupLanguageSelector();

    console.log('PixelForge initialized');
  }

  // ===== Navigation =====
  function setupNavigation() {
    $$('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        $$('.tab-content').forEach(t => t.classList.remove('active'));
        const tab = $(`#tab-${btn.dataset.tab}`);
        if (tab) tab.classList.add('active');
      });
    });

    // Mobile menu
    const menuBtn = $('#mobileMenuBtn');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        $$('.nav-links').forEach(n => n.classList.toggle('show'));
      });
    }
  }

  // ===== Upload =====
  function setupUpload() {
    const uploadArea = $('#uploadArea');
    const fileInput = $('#fileInput');
    const browseBtn = $('#browseBtn');
    const clearAllBtn = $('#clearAllBtn');

    // Click to browse
    browseBtn.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('click', (e) => {
      if (e.target === uploadArea || e.target.closest('.upload-content')) {
        fileInput.click();
      }
    });

    // File selection
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) handleFiles(e.target.files);
    });

    // Drag & drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    });

    // Clear all
    clearAllBtn.addEventListener('click', clearAll);

    // Cloud upload buttons
    $('#gdriveBtn').addEventListener('click', () => showToast(I18n.t('toast.gdriveSetup', 'Google Drive: Set your API key in Settings'), 'info'));
    $('#dropboxBtn').addEventListener('click', () => showToast(I18n.t('toast.dropboxSetup', 'Dropbox: Set your App Key in Settings'), 'info'));
  }

  function handleFiles(fileList) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/avif',
                        'image/tiff', 'image/svg+xml', 'image/x-icon'];

    const newFiles = [];
    for (const file of fileList) {
      // Check by MIME type or extension
      const ext = Converter.getFileExtension(file.name);
      const validMime = validTypes.includes(file.type);
      const validExt = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'avif', 'tiff', 'tif', 'svg', 'ico'].includes(ext);

      if (validMime || validExt) {
        // Avoid duplicates by name + size
        const isDuplicate = state.files.some(f => f.name === file.name && f.size === file.size);
        if (!isDuplicate) {
          newFiles.push(file);
        }
      }
    }

    if (newFiles.length === 0) {
      showToast(I18n.t('toast.noValidImages', 'No valid image files found'), 'error');
      return;
    }

    state.files = [...state.files, ...newFiles];
    state.results = []; // Clear previous results

    updateUploadUI();
    renderImageGrid();
    showToast(`${newFiles.length} ${I18n.t('toast.imagesAdded', 'image(s) added')}`, 'success');
  }

  function clearAll() {
    state.files = [];
    state.results = [];
    // Revoke any result URLs
    document.querySelectorAll('.result-card').forEach(card => {
      const img = card.querySelector('img');
      if (img && img.src) URL.revokeObjectURL(img.src);
    });
    updateUploadUI();
    renderImageGrid();
    hideResults();
    hideControls();
  }

  function updateUploadUI() {
    const uploadArea = $('#uploadArea');
    const imagesSection = $('#imagesSection');
    const controlsSection = $('#controlsSection');

    if (state.files.length > 0) {
      uploadArea.classList.add('has-files');
      imagesSection.style.display = 'block';
      controlsSection.style.display = 'block';
    } else {
      uploadArea.classList.remove('has-files');
      imagesSection.style.display = 'none';
      controlsSection.style.display = 'none';
    }

    $('#imageCount').textContent = state.files.length;
  }

  function renderImageGrid() {
    const grid = $('#imagesGrid');
    grid.innerHTML = '';

    state.files.forEach((file, index) => {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.dataset.index = index;

      const thumbUrl = URL.createObjectURL(file);

      card.innerHTML = `
        <img class="image-card-thumb" src="${thumbUrl}" alt="${file.name}" loading="lazy">
        <button class="image-card-remove" data-index="${index}" title="Remove">×</button>
        <div class="image-card-info">
          <span class="image-card-name" title="${file.name}">${file.name}</span>
          <span class="image-card-size">${Converter.formatFileSize(file.size)}</span>
        </div>
      `;

      // Remove individual file
      card.querySelector('.image-card-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        state.files.splice(index, 1);
        state.results = [];
        URL.revokeObjectURL(thumbUrl);
        updateUploadUI();
        renderImageGrid();
        hideResults();
      });

      // Click to edit in editor
      card.addEventListener('click', () => {
        openInEditor(file);
      });

      grid.appendChild(card);
    });
  }

  // ===== Format Selector =====
  function setupFormatSelector() {
    $$('.format-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        $$('.format-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentFormat = btn.dataset.format;
      });
    });
  }

  // ===== Quality Slider =====
  function setupQualitySlider() {
    const slider = $('#qualitySlider');
    const value = $('#qualityValue');

    slider.addEventListener('input', () => {
      state.quality = parseInt(slider.value);
      value.textContent = `${state.quality}%`;
    });
  }

  // ===== Conversion =====
  function setupConversion() {
    const convertBtn = $('#convertBtn');
    const loadingOverlay = $('#loadingOverlay');
    const loadingText = $('#loadingText');

    convertBtn.addEventListener('click', async () => {
      if (state.isConverting || state.files.length === 0) return;

      state.isConverting = true;
      convertBtn.disabled = true;
      convertBtn.innerHTML = `<div class="spinner-sm"></div> ${I18n.t('controls.converting', 'Converting...')}`;

      // Show loading overlay
      loadingOverlay.style.display = 'flex';

      // Get resize options
      const maxWidth = parseInt($('#resizeWidth').value) || null;
      const maxHeight = parseInt($('#resizeHeight').value) || null;
      const maintainAspect = $('#maintainAspect').checked;

      const options = {
        format: state.currentFormat,
        quality: state.quality,
        maxWidth,
        maxHeight,
        maintainAspect,
        rotate: 0,
        flipH: false,
        flipV: false,
      };

      try {
        // Update loading text periodically
        const progressInterval = setInterval(() => {
          loadingText.textContent = `${I18n.t('loading.processing', 'Processing images...')} (${state.files.length} ${I18n.t('loading.files', 'files')})`;
        }, 100);

        state.results = await Converter.batchConvert(state.files, options, (current, total) => {
          loadingText.textContent = `${I18n.t('loading.progress', 'Processing')} ${current}/${total}...`;
        });

        clearInterval(progressInterval);

        renderResults();
        showResults();

        const successCount = state.results.filter(r => r.success).length;
        const failCount = state.results.filter(r => !r.success).length;

        if (failCount > 0) {
          showToast(`${successCount} ${I18n.t('toast.converted', 'converted')}, ${failCount} ${I18n.t('toast.failed', 'failed')}`, 'info');
        } else {
          showToast(`${successCount} ${I18n.t('toast.converted', 'images converted successfully')}`, 'success');
        }

        // Auto download if setting enabled
        if ($('#settingsAutoDownload').checked) {
          Converter.downloadAll(state.results);
        }
      } catch (err) {
        showToast(`${I18n.t('toast.error', 'Conversion error')}: ${err.message}`, 'error');
        console.error('Conversion error:', err);
      } finally {
        state.isConverting = false;
        convertBtn.disabled = false;
        convertBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20"><path d="M17.65 6.35A8 8 0 1012 20a8 8 0 007.35-10H17.2a6 6 0 11-5.2-8 5.92 5.92 0 014.2 1.77L13 7h8V3l-3.35 3.35z" fill="currentColor"/></svg> ${I18n.t('controls.convert', 'Convert All')}`;
        loadingOverlay.style.display = 'none';
      }
    });
  }

  // ===== Results =====
  function setupResults() {
    $('#downloadAllBtn').addEventListener('click', () => {
      Converter.downloadAll(state.results);
    });
  }

  function showResults() {
    $('#resultsSection').style.display = 'block';
    $('#resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hideResults() {
    $('#resultsSection').style.display = 'none';
  }

  function hideControls() {
    $('#controlsSection').style.display = 'none';
  }

  function renderResults() {
    const grid = $('#resultsGrid');
    grid.innerHTML = '';

    state.results.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'result-card';

      if (item.success) {
        const { result } = item;
        card.innerHTML = `
          <img class="result-card-thumb" src="${result.url}" alt="${result.name}" loading="lazy">
          <div class="result-card-info">
            <span class="result-card-name" title="${result.name}">${result.name}</span>
            <div class="result-card-meta">
              <span>${result.width}×${result.height}</span>
              <span>${Converter.formatFileSize(result.size)}</span>
            </div>
            <div class="result-card-actions">
              <button class="btn btn-sm btn-primary download-one" data-index="${index}">
                ${I18n.t('results.download', 'Download')}
              </button>
              <button class="btn btn-sm btn-outline cloud-upload" data-index="${index}" title="Upload to cloud">
                <svg viewBox="0 0 24 24" width="14" height="14"><path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="currentColor"/></svg>
              </button>
            </div>
          </div>
        `;

        card.querySelector('.download-one').addEventListener('click', () => {
          Converter.downloadResult(result);
        });

        card.querySelector('.cloud-upload').addEventListener('click', () => {
          showCloudUploadDialog(result);
        });
      } else {
        card.innerHTML = `
          <div class="result-card-info" style="padding: 40px 16px; text-align: center;">
            <span style="color: #e74c3c; font-size: 1.5rem;">⚠</span>
            <span class="result-card-name" style="color: #e74c3c;">${item.file}</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${item.error}</span>
          </div>
        `;
      }

      grid.appendChild(card);
    });
  }

  // ===== Editor =====
  function setupEditor() {
    $$('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedTool = btn.dataset.tool;
        updateEditorProperties();
      });
    });

    $('#applyEditBtn').addEventListener('click', applyEdit);
    $('#resetEditBtn').addEventListener('click', resetEdit);
  }

  function openInEditor(file) {
    // Navigate to editor tab
    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    $$('.nav-btn[data-tab="editor"]').forEach(b => b.classList.add('active'));
    $$('.tab-content').forEach(t => t.classList.remove('active'));
    $('#tab-editor').classList.add('active');

    // Load image
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.editorImage = { img, dataUrl: e.target.result, file };
        const canvas = $('#editorCanvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.style.display = 'block';
        $('#editorPlaceholder').style.display = 'none';
        $('#editorProperties').style.display = 'block';
        showToast(`${file.name} ${I18n.t('toast.loadedInEditor', 'loaded in editor')}`, 'info');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function updateEditorProperties() {
    const container = $('#editorProperties');
    const tool = state.selectedTool;

    let html = `<h4 data-i18n="editor.${tool}">${tool.charAt(0).toUpperCase() + tool.slice(1)}</h4>`;

    switch (tool) {
      case 'resize':
        html += `
          <div class="prop-group">
            <label class="prop-label" data-i18n="controls.width">Width (px)</label>
            <input class="prop-input" type="number" id="editWidth" min="1">
          </div>
          <div class="prop-group">
            <label class="prop-label" data-i18n="controls.height">Height (px)</label>
            <input class="prop-input" type="number" id="editHeight" min="1">
          </div>
          <label class="checkbox-label">
            <input type="checkbox" id="editAspect" checked>
            <span data-i18n="controls.aspect">Maintain aspect ratio</span>
          </label>
        `;
        break;
      case 'rotate':
        html += `
          <div class="prop-group">
            <label class="prop-label" data-i18n="editor.angle">Angle (degrees)</label>
            <input class="prop-input" type="number" id="editAngle" value="90" step="90" min="-360" max="360">
          </div>
          <div class="prop-group" style="display:flex;gap:8px;">
            <button class="btn btn-sm btn-outline" onclick="document.getElementById('editAngle').value = 90">90°</button>
            <button class="btn btn-sm btn-outline" onclick="document.getElementById('editAngle').value = 180">180°</button>
            <button class="btn btn-sm btn-outline" onclick="document.getElementById('editAngle').value = -90">-90°</button>
          </div>
        `;
        break;
      case 'flip':
        html += `
          <label class="checkbox-label" style="margin-bottom:8px;">
            <input type="checkbox" id="editFlipH">
            <span data-i18n="editor.flipH">Flip horizontally</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="editFlipV">
            <span data-i18n="editor.flipV">Flip vertically</span>
          </label>
        `;
        break;
      case 'adjust':
        html += `
          <div class="prop-group">
            <label class="prop-label" data-i18n="editor.brightness">Brightness</label>
            <input class="prop-input" type="range" id="editBrightness" min="-100" max="100" value="0">
          </div>
          <div class="prop-group">
            <label class="prop-label" data-i18n="editor.contrast">Contrast</label>
            <input class="prop-input" type="range" id="editContrast" min="-100" max="100" value="0">
          </div>
          <div class="prop-group">
            <label class="prop-label" data-i18n="editor.saturation">Saturation</label>
            <input class="prop-input" type="range" id="editSaturation" min="-100" max="100" value="0">
          </div>
        `;
        break;
      default:
        html += `<p style="color:var(--text-muted);font-size:0.85rem;" data-i18n="editor.selectTool">Select a tool to see options</p>`;
    }

    container.innerHTML = html;

    // Re-apply translations for dynamic content
    I18n.init(); // Re-run apply
  }

  function applyEdit() {
    if (!state.editorImage) return;
    const canvas = $('#editorCanvas');
    const ctx = canvas.getContext('2d');
    const { img } = state.editorImage;
    const tool = state.selectedTool;

    // Reset canvas to original image first for non-cumulative edits
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    switch (tool) {
      case 'resize': {
        let w = parseInt($('#editWidth')?.value);
        let h = parseInt($('#editHeight')?.value);
        const aspect = $('#editAspect')?.checked;

        if (w && h && aspect) {
          const ratio = Math.min(w / img.naturalWidth, h / img.naturalHeight);
          w = Math.round(img.naturalWidth * ratio);
          h = Math.round(img.naturalHeight * ratio);
        } else if (w && !h && aspect) {
          h = Math.round(img.naturalHeight * (w / img.naturalWidth));
        } else if (h && !w && aspect) {
          w = Math.round(img.naturalWidth * (h / img.naturalHeight));
        }

        if (w || h) {
          const newCanvas = document.createElement('canvas');
          newCanvas.width = w || img.naturalWidth;
          newCanvas.height = h || img.naturalHeight;
          const newCtx = newCanvas.getContext('2d');
          newCtx.drawImage(img, 0, 0, newCanvas.width, newCanvas.height);
          canvas.width = newCanvas.width;
          canvas.height = newCanvas.height;
          ctx.drawImage(newCanvas, 0, 0);
          showToast(I18n.t('toast.resized', 'Image resized'), 'success');
        }
        break;
      }
      case 'rotate': {
        const angle = parseFloat($('#editAngle')?.value) || 0;
        const radians = (angle * Math.PI) / 180;
        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));
        const newW = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
        const newH = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);

        canvas.width = newW;
        canvas.height = newH;
        ctx.save();
        ctx.translate(newW / 2, newH / 2);
        ctx.rotate(radians);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();
        showToast(`${angle}° ${I18n.t('toast.rotated', 'rotation applied')}`, 'success');
        break;
      }
      case 'flip': {
        const flipH = $('#editFlipH')?.checked;
        const flipV = $('#editFlipV')?.checked;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();
        showToast(I18n.t('toast.flipped', 'Flip applied'), 'success');
        break;
      }
      case 'adjust': {
        const brightness = parseInt($('#editBrightness')?.value) || 0;
        const contrast = parseInt($('#editContrast')?.value) || 0;
        const saturation = parseInt($('#editSaturation')?.value) || 0;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const saturationFactor = 1 + (saturation / 100);

        for (let i = 0; i < data.length; i += 4) {
          // Brightness
          data[i]     = Math.min(255, Math.max(0, data[i] + brightness));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness));

          // Contrast
          data[i]     = Math.min(255, Math.max(0, contrastFactor * (data[i] - 128) + 128));
          data[i + 1] = Math.min(255, Math.max(0, contrastFactor * (data[i + 1] - 128) + 128));
          data[i + 2] = Math.min(255, Math.max(0, contrastFactor * (data[i + 2] - 128) + 128));

          // Saturation (simple RGB → HSL → RGB approximation)
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i]     = Math.min(255, Math.max(0, gray + (data[i] - gray) * saturationFactor));
          data[i + 1] = Math.min(255, Math.max(0, gray + (data[i + 1] - gray) * saturationFactor));
          data[i + 2] = Math.min(255, Math.max(0, gray + (data[i + 2] - gray) * saturationFactor));
        }

        ctx.putImageData(imageData, 0, 0);
        showToast(I18n.t('toast.adjusted', 'Color adjustments applied'), 'success');
        break;
      }
    }

    // Update the stored editor image reference
    state.editorImage.img = new Image();
    state.editorImage.img.src = canvas.toDataURL();
  }

  function resetEdit() {
    if (!state.editorImage) return;
    const canvas = $('#editorCanvas');
    const ctx = canvas.getContext('2d');
    const { img } = state.editorImage;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    showToast(I18n.t('toast.reset', 'Editor reset'), 'info');
  }

  // ===== Cloud Upload Dialog =====
  function showCloudUploadDialog(result) {
    const providers = ['google', 'dropbox'];
    const provider = providers[Math.floor(Math.random() * providers.length)]; // For demo

    if (provider === 'google') {
      CloudStorage.uploadToGoogleDrive(result.blob, result.name)
        .then(() => showToast(`${result.name} ${I18n.t('toast.uploaded', 'uploaded to Google Drive')}`, 'success'))
        .catch(err => showToast(`${I18n.t('toast.uploadError', 'Upload error')}: ${err.message}`, 'error'));
    } else {
      CloudStorage.uploadToDropbox(result.blob, result.name)
        .then(() => showToast(`${result.name} ${I18n.t('toast.uploaded', 'uploaded to Dropbox')}`, 'success'))
        .catch(err => showToast(`${I18n.t('toast.uploadError', 'Upload error')}: ${err.message}`, 'error'));
    }
  }

  // ===== Settings =====
  function setupSettings() {
    // Settings language select
    $('#settingsLangSelect').addEventListener('change', (e) => {
      I18n.setLanguage(e.target.value);
    });

    // Sync quality slider in settings
    $('#settingsDefaultQuality').addEventListener('input', (e) => {
      $('#settingsQualityValue').textContent = `${e.target.value}%`;
      state.quality = parseInt(e.target.value);
    });

    // Theme toggle in settings
    $('#themeToggleSetting').addEventListener('change', (e) => {
      toggleTheme(e.target.checked ? 'light' : 'dark');
    });

    // Batch size
    $('#settingsBatchSize').addEventListener('change', (e) => {
      const val = Math.min(200, Math.max(1, parseInt(e.target.value) || 50));
      e.target.value = val;
    });

    // Cloud connect buttons
    $('#gdriveConnectBtn').addEventListener('click', async () => {
      try {
        await CloudStorage.initGoogle(
          prompt('Enter Google Drive Client ID:') || ''
        );
        showToast('Google Drive connected!', 'success');
      } catch (e) {
        showToast(`Google: ${e.message}`, 'error');
      }
    });

    $('#dropboxConnectBtn').addEventListener('click', async () => {
      try {
        await CloudStorage.initDropbox(
          prompt('Enter Dropbox App Key:') || ''
        );
        showToast('Dropbox connected!', 'success');
      } catch (e) {
        showToast(`Dropbox: ${e.message}`, 'error');
      }
    });
  }

  // ===== Theme =====
  function setupThemeToggle() {
    $('#themeToggle').addEventListener('click', () => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      toggleTheme(newTheme);
    });
  }

  function toggleTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pixelforge_theme', theme);
    updateThemeUI();
  }

  function updateThemeUI() {
    const isDark = state.theme === 'dark';
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (sunIcon) sunIcon.style.display = isDark ? 'block' : 'none';
    if (moonIcon) moonIcon.style.display = isDark ? 'none' : 'block';

    // Settings toggle
    const settingToggle = $('#themeToggleSetting');
    if (settingToggle) settingToggle.checked = !isDark;

    const themeLabel = $('#themeLabel');
    if (themeLabel) {
      themeLabel.textContent = isDark
        ? I18n.t('settings.dark', 'Dark')
        : I18n.t('settings.light', 'Light');
    }
  }

  // ===== Language Selector =====
  function setupLanguageSelector() {
    $('#langSelect').addEventListener('change', (e) => {
      I18n.setLanguage(e.target.value);
    });
  }

  // ===== Toast Notifications =====
  function showToast(message, type = 'info') {
    const container = $('#toastContainer');

    const icons = { success: '✓', error: '✗', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ'}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove after 3.5s
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ===== Start =====
  document.addEventListener('DOMContentLoaded', init);
})();
