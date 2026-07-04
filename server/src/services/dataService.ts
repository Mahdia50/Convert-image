import * as fs from 'fs';
import * as path from 'path';
import { getOutputPath, cleanupFiles } from '../utils/tempFiles';
import { ConversionResult } from '../types';

export async function convertDataFormat(
  filePath: string,
  fileId: string,
  fromExt: string,
  toExt: string,
  options: Record<string, unknown> = {}
): Promise<ConversionResult> {
  const outputPath = getOutputPath(fileId, toExt);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = parseData(content, fromExt);
    const output = serializeData(data, toExt, options);
    fs.writeFileSync(outputPath, output, 'utf8');

    return {
      success: true,
      fileId,
      outputPath,
      outputName: `${fileId}.${toExt}`,
      progress: 100,
    };
  } catch (error: any) {
    cleanupFiles(outputPath);
    return {
      success: false,
      fileId,
      error: `Data conversion failed: ${error.message}`,
    };
  }
}

function parseData(content: string, format: string): unknown {
  switch (format) {
    case 'json':
      return JSON.parse(content);

    case 'xml': {
      // Simple XML to JS object — uses the fact XML is similar to JSON in simple cases
      const js2xmlparser = require('js2xmlparser');
      // For parsing, we use a minimal approach
      const xml2js: any = loadXmlModule();
      return xml2js(content);
    }

    case 'yaml':
    case 'yml': {
      const yaml = require('js-yaml');
      return yaml.load(content);
    }

    case 'toml': {
      const toml = require('toml');
      return toml.parse(content);
    }

    case 'csv': {
      const csv = require('csv-parse/sync');
      const options = { columns: true, skip_empty_lines: true, relax_column_count: true };
      return csv.parse(content, options);
    }

    default:
      throw new Error(`Unsupported input format: ${format}`);
  }
}

function serializeData(data: unknown, format: string, options: Record<string, unknown>): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, (options.pretty as boolean) !== false ? 2 : undefined);

    case 'xml': {
      // Simple JS object to XML
      const js2xmlparser = require('js2xmlparser');
      // For arrays, wrap in root
      const rootName = (options.rootName as string) || 'root';
      return js2xmlparser.parse(rootName, data);
    }

    case 'yaml': {
      const yaml = require('js-yaml');
      return yaml.dump(data, { indent: 2, lineWidth: -1 });
    }

    case 'csv': {
      if (!Array.isArray(data)) {
        throw new Error('Data must be an array of objects to convert to CSV');
      }
      const csv = require('csv-stringify/sync');
      return csv.stringify(data, { header: true });
    }

    default:
      throw new Error(`Unsupported output format: ${format}`);
  }
}

function loadXmlModule() {
  try {
    const { XMLParser } = require('fast-xml-parser');
    const parser = new XMLParser({ ignoreAttributes: false });
    return (content: string) => parser.parse(content);
  } catch {
    // Fallback: very simple XML to JSON
    return (content: string) => {
      const obj: Record<string, any> = {};
      const lines = content.split('\n').filter(l => l.trim());
      for (const line of lines) {
        const match = line.match(/<(\w+)>(.*?)<\/\1>/);
        if (match) {
          obj[match[1]] = match[2];
        }
      }
      return obj;
    };
  }
}
