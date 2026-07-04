import { Router, Request, Response } from 'express';
import { conversionQueue, convertFile } from '../services/converter';
import { saveUploadedFile, cleanupFile, getFileBuffer, getOutputPath, fileExists } from '../utils/tempFiles';
import { validateFile, validateOutputFormat, getFileCategory, getSupportedTargets, MAX_FILE_SIZE } from '../utils/fileTypes';
import { Upload } from 'multer';
import { storage } from './upload';

const router = Router();

// Configure multer for single file upload
const upload = require('multer')({ storage });

// Upload single file
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { originalname: fileName, buffer, mimetype, size } = req.file;
  const fileId = require('uuid').v4();
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // Validate the uploaded file
  const validation = validateFile(fileName, size, mimetype, buffer);
  if (!validation.valid) {
    // No temp file was created yet; just reject
    return res.status(400).json({ error: validation.error });
  }

  // Save the file using the uploader utility – it will name the file as `${fileId}.${ext}`
  const saved = saveUploadedFile(fileName, buffer, mimetype);

  // Persist the mapping between fileId and its extension (could also be stored in a DB or cache)
  // For simplicity we rely on the saved file name containing the extension.

  res.json({
    fileId,
    extension: ext,
    originalName: fileName,
    size,
    mimeType: mimetype,
    category: getFileCategory(ext),
    targets: getSupportedTargets(ext),
  });
});

// Convert file
router.post('/convert', async (req: Request, res: Response) => {
  const { fileId, fileExtension, targetFormat, options = {} } = req.body;

  if (!fileId || !fileExtension || !targetFormat) {
    return res.status(400).json({ error: 'Missing fileId, fileExtension, or targetFormat' });
  }

  // Locate the uploaded file: it is stored as `${fileId}.${fileExtension}` in the temp upload dir.
  const uploadDir = require('path').join(require('os').tmpdir(), 'pixelforge-uploads');
  const actualPath = require('path').join(uploadDir, `${fileId}.${fileExtension}`);

  if (!require('fs').existsSync(actualPath)) {
    return res.status(404).json({ error: 'Uploaded file not found' });
  }

  const result = await convertFile(actualPath, fileId, fileExtension, targetFormat, options);
  res.json(result);
});

// Get supported formats
router.get('/formats', (req: Request, res: Response) => {
  const { getFileCategory, CATEGORIES, FORMAT_MAPPINGS } = require('../utils/fileTypes');
  res.json({ categories: CATEGORIES, mappings: FORMAT_MAPPINGS });
});

// Get system status
router.get('/status', (req: Request, res: Response) => {
  const { execSync } = require('child_process');
  const tools: Record<string, boolean> = {};

  const checkTool = (name: string) => {
    try {
      execSync(`which ${name}`, { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  };

  res.json({
    tools: {
      ghostscript: checkTool('gs'),
      ffmpeg: checkTool('ffmpeg'),
      pandoc: checkTool('pandoc'),
      imagemagick: checkTool('convert'),
    },
    maxFileSize: MAX_FILE_SIZE,
  });
});

// Get job status
router.get('/jobs/:id', (req: Request, res: Response) => {
  const job = conversionQueue.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// Cancel job
router.delete('/jobs/:id', (req: Request, res: Response) => {
  const cancelled = conversionQueue.cancelJob(req.params.id);
  if (!cancelled) {
    return res.status(404).json({ error: 'Job not found or cannot be cancelled' });
  }
  res.json({ success: true });
});

// Get recent jobs
router.get('/jobs/recent', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  res.json(conversionQueue.getRecentJobs(limit));
});

// Download file
router.get('/download/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const outputPath = getOutputPath(id, ''); // Extension is already part of the filename

  if (!fileExists(outputPath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(outputPath, (err) => {
    if (err) res.status(500).json({ error: 'Download failed' });
  });
});

export default router;