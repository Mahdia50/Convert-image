import { ConversionResult } from '../types';
import { getOutputPath, cleanupFiles } from '../utils/tempFiles';

// fluent-ffmpeg wrapper — gracefully handles missing ffmpeg binary
export async function convertWithFFmpeg(
  filePath: string,
  fileId: string,
  outputFormat: string,
  options: Record<string, unknown> = {}
): Promise<ConversionResult> {
  const outputPath = getOutputPath(fileId, outputFormat);

  try {
    const ffmpeg = require('fluent-ffmpeg');

    return new Promise((resolve) => {
      const command = ffmpeg(filePath);

      // Set output options based on format
      switch (outputFormat) {
        case 'mp3':
          command.audioCodec('libmp3lame').audioBitrate((options.bitrate as string) || '192k');
          break;
        case 'wav':
          command.audioCodec('pcm_s16le');
          break;
        case 'aac':
          command.audioCodec('aac').audioBitrate((options.bitrate as string) || '192k');
          break;
        case 'flac':
          command.audioCodec('flac');
          break;
        case 'ogg':
          command.audioCodec('libvorbis').audioBitrate((options.bitrate as string) || '192k');
          break;
        case 'm4a':
          command.audioCodec('aac').audioBitrate((options.bitrate as string) || '192k');
          break;
        case 'wma':
          command.audioCodec('wmav2').audioBitrate((options.bitrate as string) || '192k');
          break;
        case 'mp4':
          command.videoCodec('libx264').audioCodec('aac');
          if (options.crf) command.outputOption(`-crf ${options.crf}`);
          break;
        case 'avi':
          command.videoCodec('libxvid').audioCodec('libmp3lame');
          break;
        case 'mov':
          command.videoCodec('libx264').audioCodec('aac');
          break;
        case 'mkv':
          command.videoCodec('libx264').audioCodec('aac');
          break;
        case 'webm':
          command.videoCodec('libvpx-vp9').audioCodec('libvorbis');
          break;
        case 'flv':
          command.videoCodec('libx264').audioCodec('aac');
          break;
        case 'wmv':
          command.videoCodec('wmv2').audioCodec('wmav2');
          break;
        case 'mpeg':
          command.videoCodec('mpeg2video').audioCodec('mp2');
          break;
        case '3gp':
          command.videoCodec('libx264').audioCodec('aac');
          break;
        case 'gif':
          command.outputOption('-vf fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse');
          break;
        default:
          throw new Error(`Unsupported FFmpeg output format: ${outputFormat}`);
      }

      // Trim options
      if (options.startTime) {
        command.setStartTime(options.startTime as string);
      }
      if (options.duration) {
        command.setDuration(options.duration as string);
      }
      if (options.endTime) {
        command.setDuration(options.endTime as string);
      }

      // Resolution change for video
      if (options.resolution) {
        command.size(options.resolution as string);
      }

      // Normalize audio
      if (options.normalize) {
        command.outputOption('-af dynaudnorm');
      }

      command
        .on('end', () => {
          resolve({
            success: true,
            fileId,
            outputPath,
            outputName: `${fileId}.${outputFormat}`,
            progress: 100,
          });
        })
        .on('error', (err: Error) => {
          cleanupFiles(outputPath);
          resolve({
            success: false,
            fileId,
            error: `FFmpeg conversion failed: ${err.message}`,
          });
        })
        .save(outputPath);
    });
  } catch (error: any) {
    cleanupFiles(outputPath);
    return {
      success: false,
      fileId,
      error: `FFmpeg not available or conversion failed: ${error.message}. Install ffmpeg: sudo apt install ffmpeg`,
    };
  }
}

export async function getMediaInfo(filePath: string) {
  try {
    const ffmpeg = require('fluent-ffmpeg');
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err: Error, metadata: any) => {
        if (err) resolve(null);
        else resolve(metadata);
      });
    });
  } catch {
    return null;
  }
}
