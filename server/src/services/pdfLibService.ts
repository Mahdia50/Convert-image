import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { getOutputPath, cleanupFiles } from '../utils/tempFiles';
import { ConversionResult } from '../types';

export async function processPDFLib(
  filePath: string,
  fileId: string,
  action: string,
  options: Record<string, unknown> = {}
): Promise<ConversionResult> {
  const outputPath = getOutputPath(fileId, 'pdf');

  try {
    const fileBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });

    switch (action) {
      case 'split': {
        const totalPages = pdfDoc.getPageCount();
        const pages = (options.pages as number[]) || [];
        const pagesToExtract = pages.length > 0 ? pages : [1]; // default to first page

        const newDoc = await PDFDocument.create();
        for (const pageNum of pagesToExtract) {
          if (pageNum >= 1 && pageNum <= totalPages) {
            const [copiedPage] = await newDoc.copyPages(pdfDoc, [pageNum - 1]);
            newDoc.addPage(copiedPage);
          }
        }

        const pdfBytes = await newDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);

        return { success: true, fileId, outputPath, outputName: `${fileId}.pdf`, progress: 100 };
      }

      case 'extract-pages': {
        const newDoc = await PDFDocument.create();
        const [copiedPage] = await newDoc.copyPages(pdfDoc, [0]);
        newDoc.addPage(copiedPage);
        const pdfBytes = await newDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);
        return { success: true, fileId, outputPath, outputName: `${fileId}.pdf`, progress: 100 };
      }

      case 'rotate-pages': {
        const degrees = (options.degrees as number) || 90;
        const pages = pdfDoc.getPages();
        for (const page of pages) {
          page.setRotation({ angle: degrees } as any);
        }
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);
        return { success: true, fileId, outputPath, outputName: `${fileId}.pdf`, progress: 100 };
      }

      default:
        return { success: false, fileId, error: `Unknown pdf-lib action: ${action}` };
    }
  } catch (error: any) {
    cleanupFiles(outputPath);
    return { success: false, fileId, error: `PDF processing failed: ${error.message}` };
  }
}

export async function mergePDFsWithLib(
  inputPaths: string[],
  outputId: string
): Promise<ConversionResult> {
  const outputPath = getOutputPath(outputId, 'pdf');

  try {
    const mergedPdf = await PDFDocument.create();

    for (const inputPath of inputPaths) {
      const fileBytes = fs.readFileSync(inputPath);
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, pdfBytes);

    return { success: true, fileId: outputId, outputPath, outputName: `${outputId}.pdf`, progress: 100 };
  } catch (error: any) {
    cleanupFiles(outputPath);
    return { success: false, fileId: outputId, error: `PDF merge failed: ${error.message}` };
  }
}

export async function createPDFFromImages(
  imagePaths: string[],
  outputId: string
): Promise<ConversionResult> {
  const outputPath = getOutputPath(outputId, 'pdf');

  try {
    const pdfDoc = await PDFDocument.create();

    for (const imgPath of imagePaths) {
      const imgBytes = fs.readFileSync(imgPath);
      const ext = path.extname(imgPath).toLowerCase();

      let image;
      if (['.jpg', '.jpeg'].includes(ext)) {
        image = await pdfDoc.embedJpg(imgBytes);
      } else {
        image = await pdfDoc.embedPng(imgBytes);
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    return { success: true, fileId: outputId, outputPath, outputName: `${outputId}.pdf`, progress: 100 };
  } catch (error: any) {
    cleanupFiles(outputPath);
    return { success: false, fileId: outputId, error: `Image to PDF failed: ${error.message}` };
  }
}
