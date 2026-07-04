import { execSync, exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { getOutputPath, cleanupFiles } from '../utils/tempFiles';
import { ConversionResult } from '../types';

function getGsPath(): string {
  try {
    const result = execSync('which gs', { encoding: 'utf8' }).trim();
    return result || 'gs';
  } catch {
    return 'gs';
  }
}

function checkGsAvailable(): boolean {
  try {
    execSync(`${getGsPath()} --version`, { encoding: 'utf8' });
    return true;
  } catch {
    return false;
  }
}

export async function convertPDFtoImages(
  filePath: string,
  fileId: string,
  outputFormat: string
): Promise<ConversionResult[]> {
  const results: ConversionResult[] = [];
  const gs = getGsPath();

  try {
    const outputDir = path.dirname(getOutputPath(fileId, 'png'));
    const outputPattern = path.join(outputDir, `${fileId}-page-%d.${outputFormat}`);

    const device = outputFormat === 'jpg' || outputFormat === 'jpeg' ? 'jpeg' : 'png16m';
    const resolution = '150';

    const cmd = `${gs} -dNOPAUSE -dBATCH -dSAFER -sDEVICE=${device} -r${resolution} -sOutputFile="${outputPattern}" "${filePath}"`;

    execSync(cmd, { stdio: 'pipe', timeout: 120000 });

    // Collect output files
    const files = fs.readdirSync(outputDir)
      .filter(f => f.startsWith(`${fileId}-page-`))
      .sort((a, b) => {
        const na = parseInt(a.match(/page-(\d+)/)?.[1] || '0');
        const nb = parseInt(b.match(/page-(\d+)/)?.[1] || '0');
        return na - nb;
      });

    for (const file of files) {
      const pageNum = file.match(/page-(\d+)/)?.[1] || '0';
      results.push({
        success: true,
        fileId: `${fileId}-page-${pageNum}`,
        outputPath: path.join(outputDir, file),
        outputName: `${fileId}-page-${pageNum}.${outputFormat}`,
        progress: 100,
      });
    }

    return results;
  } catch (error: any) {
    return [{
      success: false,
      fileId,
      error: `PDF to image conversion failed: ${error.message}`,
    }];
  }
}

export async function convertPDFtoText(
  filePath: string,
  fileId: string
): Promise<ConversionResult> {
  const outputPath = getOutputPath(fileId, 'txt');
  const gs = getGsPath();

  try {
    const cmd = `${gs} -dNOPAUSE -dBATCH -dSAFER -sDEVICE=txtwrite -sOutputFile="${outputPath}" "${filePath}"`;
    execSync(cmd, { stdio: 'pipe', timeout: 120000 });

    return {
      success: true,
      fileId,
      outputPath,
      outputName: `${fileId}.txt`,
      progress: 100,
    };
  } catch (error: any) {
    cleanupFiles(outputPath);
    return {
      success: false,
      fileId,
      error: `PDF to text conversion failed: ${error.message}`,
    };
  }
}

export async function processPDF(
  filePath: string,
  fileId: string,
  action: string,
  options: Record<string, unknown> = {}
): Promise<ConversionResult> {
  const gs = getGsPath();

  try {
    switch (action) {
      case 'compress': {
        const outputPath = getOutputPath(fileId, 'pdf');
        const pdfVersion = (options.pdfVersion as string) || '1.4';
        const cmd = `${gs} -dNOPAUSE -dBATCH -dSAFER -sDEVICE=pdfwrite -dCompatibilityLevel=${pdfVersion} -dPDFSETTINGS=/ebook -sOutputFile="${outputPath}" "${filePath}"`;
        execSync(cmd, { stdio: 'pipe', timeout: 120000 });
        return { success: true, fileId, outputPath, outputName: `${fileId}.pdf`, progress: 100 };
      }

      case 'rotate': {
        const outputPath = getOutputPath(fileId, 'pdf');
        const degrees = (options.degrees as number) || 90;
        const cmd = `${gs} -dNOPAUSE -dBATCH -dSAFER -sDEVICE=pdfwrite -c "<</Rotate ${degrees}>> setpagedevice" -f "${filePath}" -sOutputFile="${outputPath}"`;
        execSync(cmd, { stdio: 'pipe', timeout: 120000 });
        return { success: true, fileId, outputPath, outputName: `${fileId}.pdf`, progress: 100 };
      }

      case 'protect': {
        const outputPath = getOutputPath(fileId, 'pdf');
        const password = (options.password as string) || 'password';
        const cmd = `${gs} -dNOPAUSE -dBATCH -dSAFER -sDEVICE=pdfwrite -sOwnerPassword="${password}" -sUserPassword="${password}" -sOutputFile="${outputPath}" "${filePath}"`;
        execSync(cmd, { stdio: 'pipe', timeout: 120000 });
        return { success: true, fileId, outputPath, outputName: `${fileId}.pdf`, progress: 100 };
      }

      case 'unlock': {
        const outputPath = getOutputPath(fileId, 'pdf');
        const password = (options.password as string) || '';
        const cmd = password
          ? `${gs} -dNOPAUSE -dBATCH -dSAFER -sDEVICE=pdfwrite -sPDFPassword="${password}" -sOutputFile="${outputPath}" "${filePath}"`
          : `${gs} -dNOPAUSE -dBATCH -dSAFER -sDEVICE=pdfwrite -sOutputFile="${outputPath}" "${filePath}"`;
        execSync(cmd, { stdio: 'pipe', timeout: 120000 });
        return { success: true, fileId, outputPath, outputName: `${fileId}.pdf`, progress: 100 };
      }

      default:
        return { success: false, fileId, error: `Unknown PDF action: ${action}` };
    }
  } catch (error: any) {
    return { success: false, fileId, error: `PDF processing failed: ${error.message}` };
  }
}

export async function mergePDFs(
  filePaths: string[],
  outputId: string
): Promise<ConversionResult> {
  const gs = getGsPath();
  const outputPath = getOutputPath(outputId, 'pdf');

  try {
    const inputFiles = filePaths.map(f => `"${f}"`).join(' ');
    const cmd = `${gs} -dNOPAUSE -dBATCH -dSAFER -sDEVICE=pdfwrite -sOutputFile="${outputPath}" ${inputFiles}`;
    execSync(cmd, { stdio: 'pipe', timeout: 120000 });

    return { success: true, fileId: outputId, outputPath, outputName: `${outputId}.pdf`, progress: 100 };
  } catch (error: any) {
    cleanupFiles(outputPath);
    return { success: false, fileId: outputId, error: `PDF merge failed: ${error.message}` };
  }
}
