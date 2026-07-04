import sharp from 'sharp';
import * as path from 'path';
import { getOutputPath, cleanupFiles } from '../utils/tempFiles';
import { ConversionResult } from '../types';

export async function convertWithSharp(
  filePath: string,
  fileId: string,
  outputFormat: string,
  options: Record<string, unknown> = {}
): Promise<ConversionResult> {
  const outputPath = getOutputPath(fileId, outputFormat);
  const quality = (options.quality as number) || 90;
  const width = options.width as number | undefined;
  const height = options.height as number | undefined;
  const rotate = (options.rotate as number) || 0;

  try {
    let pipeline = sharp(filePath);

    // Apply metadata/rotation
    if (rotate !== 0) {
      pipeline = pipeline.rotate(rotate);
    }

    // Auto-orient based on EXIF
    pipeline = pipeline.rotate();

    // Resize if specified
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: options.fit as keyof sharp.FitEnum || 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to output format
    switch (outputFormat) {
      case 'jpg':
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        break;
      case 'png':
        pipeline = pipeline.png({ compressionLevel: 9, palette: quality > 90 });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'gif':
        pipeline = pipeline.gif({});
        break;
      case 'tiff':
      case 'tif':
        pipeline = pipeline.tiff({ quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality });
        break;
      case 'bmp':
        pipeline = pipeline.bmp();
        break;
      case 'heic':
        pipeline = pipeline.heif({ quality, compression: 'hevc' });
        break;
      default:
        throw new Error(`Unsupported image output format: ${outputFormat}`);
    }

    await pipeline.toFile(outputPath);

    const metadata = await sharp(outputPath).metadata();

    return {
      success: true,
      fileId,
      outputPath,
      outputName: `${fileId}.${outputFormat}`,
      progress: 100,
    };
  } catch (error: any) {
    cleanupFiles(outputPath);
    return {
      success: false,
      fileId,
      error: `Image conversion failed: ${error.message}`,
    };
  }
}

export async function getImageInfo(filePath: string) {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      channels: metadata.channels,
    };
  } catch {
    return null;
  }
}
