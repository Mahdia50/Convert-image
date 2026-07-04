import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import { getOutputPath, cleanupFiles } from '../utils/tempFiles';
import { ConversionResult } from '../types';

export async function createZipArchive(
  files: { path: string; name: string }[],
  outputId: string
): Promise<ConversionResult> {
  const outputPath = getOutputPath(outputId, 'zip');

  return new Promise((resolve) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      resolve({
        success: true,
        fileId: outputId,
        outputPath,
        outputName: `${outputId}.zip`,
        progress: 100,
      });
    });

    archive.on('error', (err: Error) => {
      cleanupFiles(outputPath);
      resolve({
        success: false,
        fileId: outputId,
        error: `Archive creation failed: ${err.message}`,
      });
    });

    archive.pipe(output);

    for (const file of files) {
      if (fs.existsSync(file.path)) {
        archive.file(file.path, { name: file.name });
      }
    }

    archive.finalize();
  });
}

export async function extractArchive(
  filePath: string,
  fileId: string,
  format: string
): Promise<ConversionResult> {
  // For now, return a message that extraction is handled client-side
  // Full extraction support can be added with adm-zip or unzipper
  return {
    success: false,
    fileId,
    error: `Archive extraction for .${format} is not yet supported server-side.`,
  };
}

export async function getArchiveContents(
  filePath: string
): Promise<string[]> {
  try {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(filePath);
    return zip.getEntries().map((e: any) => e.entryName);
  } catch {
    return [];
  }
}
