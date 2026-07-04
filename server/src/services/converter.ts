import { ConversionResult, ConversionJob } from '../types';
import { findMapping, getFileCategory } from '../utils/fileTypes';
import { convertWithSharp } from './sharpService';
import { convertWithFFmpeg } from './ffmpegService';
import { processPDF, convertPDFtoImages, convertPDFtoText, mergePDFs } from './ghostscriptService';
import { processPDFLib, mergePDFsWithLib, createPDFFromImages } from './pdfLibService';
import { convertDataFormat } from './dataService';
import { convertDocument, convertMarkdown } from './documentService';
import { createZipArchive } from './archiveService';
import { getFileBuffer, getOutputPath, cleanupFiles } from '../utils/tempFiles';
import { v4 as uuid } from 'uuid';
import { ConversionJob, ConversionResult } from '../types';

class ConversionQueue {
  private jobs: Map<string, ConversionJob> = new Map();
  private activeJobs: Set<string> = new Set();
  private maxConcurrent = 4;

  addJob(job: ConversionJob): void {
    this.jobs.set(job.id, job);
  }

  getJob(id: string): ConversionJob | undefined {
    return this.jobs.get(id);
  }

  updateJob(id: string, updates: Partial<ConversionJob>): void {
    const job = this.jobs.get(id);
    if (job) {
      Object.assign(job, updates, { updatedAt: new Date() });
    }
  }

  cancelJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (job && (job.status === 'pending' || job.status === 'processing')) {
      job.status = 'cancelled';
      job.updatedAt = new Date();
      return true;
    }
    return false;
  }

  getAllJobs(): ConversionJob[] {
    return Array.from(this.jobs.values());
  }

  getRecentJobs(limit = 20): ConversionJob[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const conversionQueue = new ConversionQueue();

export async function convertFile(
  filePath: string,
  fileId: string,
  fromExt: string,
  toExt: string,
  options: Record<string, unknown> = {}
): Promise<ConversionResult> {
  const mapping = findMapping(fromExt, toExt);
  if (!mapping) {
    return {
      success: false,
      fileId,
      error: `No conversion path found from .${fromExt} to .${toExt}`,
    };
  }

  const job: ConversionJob = {
    id: fileId,
    status: 'processing',
    fileName: `${fileId}.${fromExt}`,
    filePath: '',
    outputFormat: toExt,
    options,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  conversionQueue.addJob(job);

  try {
    let result: ConversionResult;

    switch (mapping.engine) {
      case 'sharp':
        result = await convertWithSharp(filePath, fileId, toExt, options);
        break;

      case 'ffmpeg':
        result = await convertWithFFmpeg(filePath, fileId, toExt, options);
        break;

      case 'ghostscript':
        if (toExt === 'txt') {
          result = await convertPDFtoText(filePath, fileId);
        } else if (['png', 'jpg', 'jpeg'].includes(toExt)) {
          const results = await convertPDFtoImages(filePath, fileId, toExt);
          result = results[0] || { success: false, fileId, error: 'No pages extracted' };
        } else {
          result = await processPDF(filePath, fileId, 'compress', options);
        }
        break;

      case 'pdf-lib':
        result = await processPDFLib(filePath, fileId, 'split', options);
        break;

      case 'native':
        result = await convertDataFormat(filePath, fileId, fromExt, toExt, options);
        break;

      case 'mammoth':
        result = await convertDocument(filePath, fileId, fromExt, toExt, options);
        break;

      case 'panDoc':
        result = await convertDocument(filePath, fileId, fromExt, toExt, options);
        break;

      default:
        result = { success: false, fileId, error: `No conversion engine available for ${fromExt} → ${toExt}` };
    }

    job.status = result.success ? 'completed' : 'failed';
    job.result = result;
    job.updatedAt = new Date();

    return result;
  } catch (error: any) {
    const result: ConversionResult = {
      success: false,
      fileId,
      error: `Unexpected error: ${error.message}`,
    };
    job.status = 'failed';
    job.result = result;
    job.updatedAt = new Date();
    return result;
  }
}

export { ConversionQueue, ConversionJob };
