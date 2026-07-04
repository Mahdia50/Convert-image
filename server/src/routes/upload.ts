import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

export const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(require('os').tmpdir(), 'pixelforge-uploads'));
  },
  filename: (req, file, cb) => {
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

module.exports = { storage, uploadConfig };