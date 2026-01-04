import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';

export const uploadStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileId = uuid().replace(/-/g, '');
    const ext = extname(file.originalname);
    cb(null, `${fileId}${ext}`);
  },
});
