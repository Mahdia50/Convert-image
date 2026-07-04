/* =============================================
   Convertinoall - Universal File Converter Module
   Handles backend API, queue, PDF & media tools
   ============================================= */

const Universal = (() => {
  'use strict';

  // Configuration
  const API_BASE = 'http://localhost:3000/api';
  const PIXELFROG_API_KEY = 'pixelforge-demo-key';

  // State
  const queue = [];
  let selectedPdfTool = null;
  let selectedMediaTool = null;
  let pdfFiles = [];
  let mediaFiles = [];

  // ===== Backend API =====
  async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    };
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  }

  async function checkBackendStatus() {
    try {
      const status = await apiRequest('/status');
      return status;
    } catch {
      return { status: 'offline', tools: {} };
    }
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Upload error:', err.message);
      throw err;
    }
  }

  async function convertFile(fileId, fileExtension, targetFormat, options = {}) {
    return apiRequest('/convert', {
      method: 'POST',
      body: JSON.stringify({ fileId, fileExtension, targetFormat, options }),
    });
  }

  async function downloadFile(fileId) {
    window.open(`${API_BASE}/download/${fileId}`, '_blank');
  }

  async function getJob(jobId) {
    return apiRequest(`/jobs/${jobId}`);
  }

  async function cancelJob(jobId) {
    return apiRequest(`/jobs/${jobId}`, { method: 'DELETE' });
  }

  async function getRecentJobs() {
    return apiRequest('/jobs/recent');
  }

  async function getFormats() {
    return apiRequest('/formats');
  }

  // ===== File Category Helpers =====
  function getFileExtension(fileName) {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  function getFileCategory(ext) {
    const categories = {
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
    for (const [cat, exts] of Object.entries(categories)) {
      if (exts.includes(ext)) return cat;
    }
    return 'unknown';
  }

  function getFormatLabel(ext) {
    const labels = {
      pdf: 'PDF', doc: 'DOC', docx: 'DOCX', odt: 'ODT', rtf: 'RTF', txt: 'TXT',
      html: 'HTML', md: 'Markdown', xls: 'XLS', xlsx: 'XLSX', csv: 'CSV', ods: 'ODS',
      ppt: 'PPT', pptx: 'PPTX', odp: 'ODP',
      jpg: 'JPG', jpeg: 'JPEG', png: 'PNG', webp: 'WEBP', gif: 'GIF', bmp: 'BMP', tiff: 'TIFF', svg: 'SVG', avif: 'AVIF',
      mp3: 'MP3', wav: 'WAV', aac: 'AAC', flac: 'FLAC', ogg: 'OGG', m4a: 'M4A', wma: 'WMA',
      mp4: 'MP4', avi: 'AVI', mov: 'MOV', mkv: 'MKV', webm: 'WEBM', flv: 'FLV', wmv: 'WMV', mpeg: 'MPEG', '3gp': '3GP',
      zip: 'ZIP', rar: 'RAR', '7z': '7Z', tar: 'TAR', gz: 'GZ',
      epub: 'EPUB', mobi: 'MOBI', azw3: 'AZW3', fb2: 'FB2',
      json: 'JSON', xml: 'XML', yaml: 'YAML', yml: 'YAML', toml: 'TOML',
    };
    return labels[ext] || ext.toUpperCase();
  }

  // ===== Queue Management =====
  function addToQueue(item) {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      fileName: item.fileName,
      fileSize: item.fileSize,
      targetFormat: item.targetFormat,
      status: item.status || 'pending',
      progress: 0,
      fileId: item.fileId,
      resultPath: null,
      error: null,
      createdAt: new Date(),
      ...item,
    };
    queue.push(entry);
    renderQueue();
    return entry;
  }

  function updateQueueEntry(id, updates) {
    const idx = queue.findIndex(e => e.id === id);
    if (idx !== -1) {
      Object.assign(queue[idx], updates);
      renderQueue();
    }
  }

  function removeQueueEntry(id) {
    const idx = queue.findIndex(e => e.id === id);
    if (idx !== -1) {
      queue.splice(idx, 1);
      renderQueue();
    }
  }

  function clearQueue() {
    queue.length = 0;
    renderQueue();
  }

  function renderQueue() {
    const list = document.getElementById('queueList');
    const activeEl = document.getElementById('queueActive');
    const completedEl = document.getElementById('queueCompleted');
    const failedEl = document.getElementById('queueFailed');
    const totalEl = document.getElementById('queueTotal');

    if (!list) return;

    const active = queue.filter(e => e.status === 'pending' || e.status === 'processing').length;
    const completed = queue.filter(e => e.status === 'completed').length;
    const failed = queue.filter(e => e.status === 'failed').length;

    if (activeEl) activeEl.textContent = active;
    if (completedEl) completedEl.textContent = completed;
    if (failedEl) failedEl.textContent = failed;
    if (totalEl) totalEl.textContent = queue.length;

    if (queue.length === 0) {
      list.innerHTML = '<div class="queue-empty">No conversions yet. Upload a file and start converting!</div>';
      return;
    }

    list.innerHTML = queue.map(item => `
      <div class="queue-item" data-id="${item.id}">
        <div class="queue-icon" style="background: ${getStatusColor(item.status)}20;">
          ${getFileIcon(item.fileName)}
        </div>
        <div class="queue-info">
          <div class="queue-name">${escapeHtml(item.fileName)}</div>
          <div class="queue-meta">
            ${formatFileSize(item.fileSize)} → ${(item.targetFormat || '').toUpperCase()}
            ${item.error ? `<span style="color:#ef4444;margin-left:8px;">${escapeHtml(item.error)}</span>` : ''}
          </div>
          ${item.status === 'processing' ? `
            <div class="queue-progress-bar">
              <div class="queue-progress-fill" style="width:${item.progress || 0}%"></div>
            </div>
          ` : ''}
        </div>
        <span class="queue-status ${item.status}">${item.status}</span>
        ${item.status === 'completed' && item.resultPath ? `
          <button class="btn btn-sm btn-primary queue-download" data-path="${item.resultPath}" title="Download">⬇</button>
        ` : ''}
        ${item.status === 'pending' || item.status === 'processing' ? `
          <button class="btn btn-sm btn-outline queue-cancel" data-id="${item.id}" title="Cancel">✕</button>
        ` : ''}
      </div>
    `).join('');

    // Attach event listeners
    list.querySelectorAll('.queue-download').forEach(btn => {
      btn.addEventListener('click', () => {
        downloadFile(btn.dataset.path);
      });
    });
    list.querySelectorAll('.queue-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        cancelJob(btn.dataset.id).catch(() => {});
        updateQueueEntry(btn.dataset.id, { status: 'cancelled' });
      });
    });
  }

  function getStatusColor(status) {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      completed: '#22c55e',
      failed: '#ef4444',
      cancelled: '#6b7280',
    };
    return colors[status] || '#6b7280';
  }

  function getFileIcon(fileName) {
    const ext = getFileExtension(fileName);
    const icons = {
      pdf: '📄', doc: '📝', docx: '📝', txt: '📃', html: '🌐', md: '📝',
      xls: '📊', xlsx: '📊', csv: '📋',
      ppt: '📽️', pptx: '📽️',
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', webp: '🖼️', gif: '🖼️',
      mp3: '🎵', wav: '🎵', flac: '🎵', ogg: '🎵',
      mp4: '🎬', avi: '🎬', mov: '🎬', mkv: '🎬',
      zip: '📦', rar: '📦',
      epub: '📚',
      json: '📋', xml: '📋', yaml: '📋',
    };
    return icons[ext] || '📁';
  }

  // ===== Helper Functions =====
  function formatFileSize(bytes) {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }
    return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== PDF Tools =====
  function initPdfTools() {
    document.querySelectorAll('[data-pdf-tool]').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('[data-pdf-tool]').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedPdfTool = card.dataset.pdfTool;
        showPdfUpload(selectedPdfTool);
      });
    });

    const pdfBrowseBtn = document.getElementById('pdfBrowseBtn');
    const pdfFileInput = document.getElementById('pdfFileInput');
    const pdfUploadArea = document.getElementById('pdfUploadArea');
    const pdfExecuteBtn = document.getElementById('pdfExecuteBtn');

    if (pdfBrowseBtn && pdfFileInput) {
      pdfBrowseBtn.addEventListener('click', () => pdfFileInput.click());
      pdfFileInput.addEventListener('change', handlePdfFiles);
    }

    if (pdfUploadArea) {
      pdfUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        pdfUploadArea.style.borderColor = 'var(--accent-primary)';
      });
      pdfUploadArea.addEventListener('dragleave', () => {
        pdfUploadArea.style.borderColor = '';
      });
      pdfUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        pdfUploadArea.style.borderColor = '';
        if (e.dataTransfer.files.length) {
          pdfFileInput.files = e.dataTransfer.files;
          handlePdfFiles();
        }
      });
    }

    if (pdfExecuteBtn) {
      pdfExecuteBtn.addEventListener('click', executePdfTool);
    }
  }

  function handlePdfFiles() {
    const input = document.getElementById('pdfFileInput');
    if (!input || !input.files.length) return;
    pdfFiles = Array.from(input.files);
    document.getElementById('pdfUploadTitle').textContent = `${pdfFiles.length} file(s) selected`;
    const uploadDiv = document.getElementById('pdfToolUpload');
    if (uploadDiv) uploadDiv.style.display = 'block';
    showPdfSettings();
  }

  function showPdfUpload(tool) {
    const uploadDiv = document.getElementById('pdfToolUpload');
    if (!uploadDiv) return;
    uploadDiv.style.display = 'block';
    const title = document.getElementById('pdfUploadTitle');
    const labels = {
      'word-to-pdf': 'Upload DOC/DOCX files',
      'pdf-to-word': 'Upload PDF files',
      'merge': 'Upload multiple PDF files',
      'split': 'Upload a PDF file',
      'compress': 'Upload a PDF file',
      'rotate': 'Upload a PDF file',
      'protect': 'Upload a PDF file',
      'unlock': 'Upload a PDF file',
      'pdf-to-images': 'Upload a PDF file',
      'images-to-pdf': 'Upload image files',
    };
    if (title) title.textContent = labels[tool] || 'Drop files here';
    
    // Set accept attribute based on tool
    const input = document.getElementById('pdfFileInput');
    if (input) {
      input.accept = ['word-to-pdf'].includes(tool) ? '.doc,.docx' :
        ['images-to-pdf'].includes(tool) ? 'image/*' :
        '.pdf';
    }
    showPdfSettings();
  }

  function showPdfSettings() {
    const settings = document.getElementById('pdfToolSettings');
    if (!settings) return;

    let html = '';
    switch (selectedPdfTool) {
      case 'compress':
        html = `
          <label class="control-label">Compression Level</label>
          <div class="quality-control">
            <input type="range" id="pdfCompressLevel" min="1" max="3" value="2">
            <span id="pdfCompressLabel">Medium</span>
          </div>
          <script>
            document.getElementById('pdfCompressLevel')?.addEventListener('input', function() {
              const labels = ['Low', 'Medium', 'High'];
              document.getElementById('pdfCompressLabel').textContent = labels[this.value - 1];
            });
          <\/script>
        `;
        break;
      case 'rotate':
        html = `
          <label class="control-label">Rotation</label>
          <select id="pdfRotateAngle" style="width:100%;padding:8px;border-radius:8px;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-light);">
            <option value="90">90° Clockwise</option>
            <option value="180">180°</option>
            <option value="270">270° Clockwise</option>
          </select>
        `;
        break;
      case 'protect':
        html = `
          <label class="control-label">Password</label>
          <input type="password" id="pdfPassword" placeholder="Enter password" style="width:100%;padding:8px;border-radius:8px;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-light);">
        `;
        break;
      case 'unlock':
        html = `
          <label class="control-label">Password (if known)</label>
          <input type="password" id="pdfUnlockPassword" placeholder="Leave blank if unknown" style="width:100%;padding:8px;border-radius:8px;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-light);">
        `;
        break;
      case 'split':
        html = `
          <label class="control-label">Page Range</label>
          <div style="display:flex;gap:8px;">
            <input type="number" id="splitFrom" placeholder="From" min="1" style="flex:1;padding:8px;border-radius:8px;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-light);">
            <span style="align-self:center;">to</span>
            <input type="number" id="splitTo" placeholder="To" min="1" style="flex:1;padding:8px;border-radius:8px;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-light);">
          </div>
        `;
        break;
      default:
        html = '<p style="color:var(--text-muted);font-size:13px;">Select files and click Execute to proceed.</p>';
    }
    settings.innerHTML = html;
  }

  async function executePdfTool() {
    if (!selectedPdfTool || pdfFiles.length === 0) {
      showToast('Please select a tool and upload files first.', 'error');
      return;
    }

    const executeBtn = document.getElementById('pdfExecuteBtn');
    if (executeBtn) {
      executeBtn.disabled = true;
      executeBtn.textContent = 'Processing...';
    }

    try {
      // Upload all files
      const uploaded = [];
      for (const file of pdfFiles) {
        const result = await uploadFile(file);
        uploaded.push(result);
      }

      // Execute the tool
      for (const file of uploaded) {
        addToQueue({
          fileName: file.originalName,
          fileSize: file.size,
          targetFormat: selectedPdfTool,
          fileId: file.fileId,
          status: 'processing',
          progress: 0,
        });
      }

      showToast(`${uploaded.length} file(s) queued for PDF processing. Check the Queue tab.`, 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      if (executeBtn) {
        executeBtn.disabled = false;
        executeBtn.textContent = 'Execute';
      }
    }
  }

  // ===== Media Tools =====
  function initMediaTools() {
    document.querySelectorAll('[data-media-tool]').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('[data-media-tool]').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedMediaTool = card.dataset.mediaTool;
        showMediaUpload(selectedMediaTool);
      });
    });

    const mediaBrowseBtn = document.getElementById('mediaBrowseBtn');
    const mediaFileInput = document.getElementById('mediaFileInput');
    const mediaUploadArea = document.getElementById('mediaUploadArea');
    const mediaExecuteBtn = document.getElementById('mediaExecuteBtn');

    if (mediaBrowseBtn && mediaFileInput) {
      mediaBrowseBtn.addEventListener('click', () => mediaFileInput.click());
      mediaFileInput.addEventListener('change', handleMediaFiles);
    }

    if (mediaUploadArea) {
      mediaUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        mediaUploadArea.style.borderColor = 'var(--accent-primary)';
      });
      mediaUploadArea.addEventListener('dragleave', () => {
        mediaUploadArea.style.borderColor = '';
      });
      mediaUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        mediaUploadArea.style.borderColor = '';
        if (e.dataTransfer.files.length) {
          mediaFileInput.files = e.dataTransfer.files;
          handleMediaFiles();
        }
      });
    }

    if (mediaExecuteBtn) {
      mediaExecuteBtn.addEventListener('click', executeMediaTool);
    }
  }

  function handleMediaFiles() {
    const input = document.getElementById('mediaFileInput');
    if (!input || !input.files.length) return;
    mediaFiles = Array.from(input.files);
    document.getElementById('mediaUploadTitle').textContent = `${mediaFiles.length} file(s) selected`;
    const uploadDiv = document.getElementById('mediaToolUpload');
    if (uploadDiv) uploadDiv.style.display = 'block';
    showMediaSettings();
  }

  function showMediaUpload(tool) {
    const uploadDiv = document.getElementById('mediaToolUpload');
    if (!uploadDiv) return;
    uploadDiv.style.display = 'block';
    const title = document.getElementById('mediaUploadTitle');
    const labels = {
      'convert-video': 'Upload video files',
      'compress-video': 'Upload a video file',
      'trim-video': 'Upload a video file',
      'extract-audio': 'Upload a video file',
      'convert-audio': 'Upload audio files',
      'trim-audio': 'Upload an audio file',
      'change-resolution': 'Upload a video file',
      'create-gif': 'Upload a video file',
    };
    if (title) title.textContent = labels[tool] || 'Drop media files here';

    const input = document.getElementById('mediaFileInput');
    if (input) {
      const audioTools = ['convert-audio', 'trim-audio'];
      input.accept = audioTools.includes(tool) ? 'audio/*' : 'video/*';
    }
    showMediaSettings();
  }

  function showMediaSettings() {
    const settings = document.getElementById('mediaToolSettings');
    if (!settings) return;

    let html = '';
    switch (selectedMediaTool) {
      case 'convert-video':
      case 'convert-audio':
        html = `
          <label class="control-label">Output Format</label>
          <select id="mediaOutputFormat" style="width:100%;padding:8px;border-radius:8px;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-light);">
            ${selectedMediaTool === 'convert-video' ? `
              <option value="mp4">MP4</option>
              <option value="avi">AVI</option>
              <option value="mov">MOV</option>
              <option value="mkv">MKV</option>
              <option value="webm">WEBM</option>
            ` : `
              <option value="mp3">MP3</option>
              <option value="wav">WAV</option>
              <option value="flac">FLAC</option>
              <option value="ogg">OGG</option>
              <option value="aac">AAC</option>
            `}
          </select>
        `;
        break;
      case 'compress-video':
        html = `
          <label class="control-label">Quality</label>
          <div class="quality-control">
            <input type="range" id="mediaQuality" min="18" max="51" value="28">
            <span id="mediaQualityLabel">28 (Good)</span>
          </div>
          <script>
            document.getElementById('mediaQuality')?.addEventListener('input', function() {
              const labels = {18:'High',23:'Good',28:'Medium',35:'Low',51:'Lowest'};
              const nearest = Object.keys(labels).reduce((a,b) => Math.abs(b-this.value)<Math.abs(a-this.value)?b:a);
              document.getElementById('mediaQualityLabel').textContent = this.value + ' (' + labels[nearest] + ')';
            });
          <\/script>
        `;
        break;
      case 'trim-video':
      case 'trim-audio':
        html = `
          <label class="control-label">Start Time (seconds)</label>
          <input type="number" id="trimStart" value="0" min="0" style="width:100%;padding:8px;border-radius:8px;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-light);">
          <label class="control-label" style="margin-top:8px;">Duration (seconds)</label>
          <input type="number" id="trimDuration" value="10" min="1" style="width:100%;padding:8px;border-radius:8px;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-light);">
        `;
        break;
      case 'change-resolution':
        html = `
          <label class="control-label">Resolution</label>
          <select id="mediaResolution" style="width:100%;padding:8px;border-radius:8px;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-light);">
            <option value="1920x1080">1920×1080 (1080p)</option>
            <option value="1280x720">1280×720 (720p)</option>
            <option value="854x480">854×480 (480p)</option>
            <option value="640x360">640×360 (360p)</option>
          </select>
        `;
        break;
      case 'create-gif':
        html = `
          <label class="control-label">Start Time (seconds)</label>
          <input type="number" id="gifStart" value="0" min="0" style="width:100%;padding:8px;border-radius:8px;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-light);">
          <label class="control-label" style="margin-top:8px;">Duration (seconds)</label>
          <input type="number" id="gifDuration" value="3" min="1" style="width:100%;padding:8px;border-radius:8px;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-light);">
        `;
        break;
      default:
        html = '<p style="color:var(--text-muted);font-size:13px;">Select files and click Execute to proceed.</p>';
    }
    settings.innerHTML = html;
  }

  async function executeMediaTool() {
    if (!selectedMediaTool || mediaFiles.length === 0) {
      showToast('Please select a tool and upload files first.', 'error');
      return;
    }

    const executeBtn = document.getElementById('mediaExecuteBtn');
    if (executeBtn) {
      executeBtn.disabled = true;
      executeBtn.textContent = 'Processing...';
    }

    try {
      const uploaded = [];
      for (const file of mediaFiles) {
        const result = await uploadFile(file);
        uploaded.push(result);
      }

      for (const file of uploaded) {
        addToQueue({
          fileName: file.originalName,
          fileSize: file.size,
          targetFormat: selectedMediaTool,
          fileId: file.fileId,
          status: 'processing',
          progress: 0,
        });
      }

      showToast(`${uploaded.length} file(s) queued for media processing. Check the Queue tab.`, 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      if (executeBtn) {
        executeBtn.disabled = false;
        executeBtn.textContent = 'Execute';
      }
    }
  }

  // ===== Toast Notifications =====
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${escapeHtml(message)}</span>
      <button class="toast-close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  }

  // ===== Init =====
  function init() {
    initPdfTools();
    initMediaTools();

    // Queue tab actions
    const clearBtn = document.getElementById('clearQueueBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearQueue);
    }

    const downloadAllBtn = document.getElementById('downloadAllQueueBtn');
    if (downloadAllBtn) {
      downloadAllBtn.addEventListener('click', () => {
        const completed = queue.filter(e => e.status === 'completed' && e.resultPath);
        completed.forEach(item => downloadFile(item.resultPath));
      });
    }

    // Check backend status on load
    checkBackendStatus().then(status => {
      console.log('Backend status:', status);
      if (status && status.tools) {
        const toolsAvailable = Object.entries(status.tools)
          .filter(([, v]) => v)
          .map(([k]) => k);
        console.log('Available tools:', toolsAvailable);
      }
    });

    console.log('Universal Converter module initialized');
  }

  // Return public API
  return {
    init,
    addToQueue,
    updateQueueEntry,
    removeQueueEntry,
    clearQueue,
    getQueue: () => [...queue],
    checkBackendStatus,
    uploadFile,
    convertFile,
    downloadFile,
    getFileCategory,
    getFileExtension,
    showToast,
    queue,
  };
})();

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Universal.init());
} else {
  Universal.init();
}
