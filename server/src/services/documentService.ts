import * as fs from 'fs';
import * as path from 'path';
import { getOutputPath, cleanupFiles } from '../utils/tempFiles';
import { ConversionResult } from '../types';

/**
 * Converts DOCX to other formats using mammoth for extraction + custom serialization
 */
export async function convertDocument(
  filePath: string,
  fileId: string,
  fromExt: string,
  toExt: string,
  options: Record<string, unknown> = {}
): Promise<ConversionResult> {
  const outputPath = getOutputPath(fileId, toExt);

  try {
    switch (fromExt) {
      case 'docx': {
        const mammoth = require('mammoth');

        if (toExt === 'html') {
          const result = await mammoth.convertToHtml({ path: filePath });
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${result.value}</body></html>`;
          fs.writeFileSync(outputPath, html, 'utf8');
          return { success: true, fileId, outputPath, outputName: `${fileId}.html`, progress: 100 };
        }

        if (toExt === 'txt' || toExt === 'md') {
          const result = await mammoth.extractRawText({ path: filePath });
          fs.writeFileSync(outputPath, result.value, 'utf8');
          return { success: true, fileId, outputPath, outputName: `${fileId}.${toExt}`, progress: 100 };
        }

        // Fallback: try pandoc if available
        return await convertWithPandoc(filePath, fileId, fromExt, toExt, options);
      }

      case 'doc': {
        // .doc files need LibreOffice or pandoc
        return await convertWithPandoc(filePath, fileId, fromExt, toExt, options);
      }

      case 'odt':
      case 'rtf':
      case 'txt':
      case 'html':
      case 'md': {
        return await convertWithPandoc(filePath, fileId, fromExt, toExt, options);
      }

      default:
        return { success: false, fileId, error: `Unsupported document format: ${fromExt}` };
    }
  } catch (error: any) {
    cleanupFiles(outputPath);
    return { success: false, fileId, error: `Document conversion failed: ${error.message}` };
  }
}

async function convertWithPandoc(
  filePath: string,
  fileId: string,
  fromExt: string,
  toExt: string,
  options: Record<string, unknown> = {}
): Promise<ConversionResult> {
  const outputPath = getOutputPath(fileId, toExt);

  try {
    const { execSync } = require('child_process');

    // Map extensions to pandoc format names
    const formatMap: Record<string, string> = {
      docx: 'docx', doc: 'doc', odt: 'odt', rtf: 'rtf',
      txt: 'plain', html: 'html', md: 'markdown',
      pdf: 'pdf', csv: 'csv',
      pptx: 'pptx', ppt: 'ppt', odp: 'odp',
      xlsx: 'xlsx', xls: 'xls', ods: 'ods',
      epub: 'epub', mobi: 'mobi',
    };

    const from = formatMap[fromExt] || fromExt;
    const to = formatMap[toExt] || toExt;

    const cmd = `pandoc "${filePath}" -f "${from}" -t "${to}" -o "${outputPath}"`;
    execSync(cmd, { stdio: 'pipe', timeout: 120000 });

    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
      return { success: true, fileId, outputPath, outputName: `${fileId}.${toExt}`, progress: 100 };
    }

    throw new Error('Output file is empty');
  } catch (error: any) {
    cleanupFiles(outputPath);
    const msg = error.message.includes('pandoc not found')
      ? 'Pandoc is not installed. Install it with: sudo apt install pandoc'
      : error.message;
    return { success: false, fileId, error: `Document conversion failed: ${msg}` };
  }
}

/**
 * Convert markdown to HTML or other lightweight conversions
 */
export async function convertMarkdown(
  filePath: string,
  fileId: string,
  toExt: string
): Promise<ConversionResult> {
  const outputPath = getOutputPath(fileId, toExt);

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    if (toExt === 'html') {
      const { marked } = require('marked');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${marked.parse(content)}</body></html>`;
      fs.writeFileSync(outputPath, html, 'utf8');
      return { success: true, fileId, outputPath, outputName: `${fileId}.html`, progress: 100 };
    }

    if (toExt === 'txt') {
      // Simple markdown to plain text stripping
      const plain = content
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*{1,3}/g, '')
        .replace(/`{1,3}/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
      fs.writeFileSync(outputPath, plain, 'utf8');
      return { success: true, fileId, outputPath, outputName: `${fileId}.txt`, progress: 100 };
    }

    return await convertWithPandoc(filePath, fileId, 'md', toExt);
  } catch (error: any) {
    cleanupFiles(outputPath);
    return { success: false, fileId, error: `Markdown conversion failed: ${error.message}` };
  }
}
