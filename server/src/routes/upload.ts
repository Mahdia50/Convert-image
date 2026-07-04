import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

import * as fs from 'fs';
import * as os from 'os';

const uploadDir = path.join(os.tmpdir(), 'pixelforge-uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export const storage = diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

export const uploadConfig = {
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
    files: 100,
  },
  storage,
};