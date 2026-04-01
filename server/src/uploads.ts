import fs from 'fs';
import multer from 'multer';
import path from 'path';
import type { Request } from 'express';
import { config } from './config.js';

const avatarMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const recordingMimeTypes = [
  'audio/ogg',
  'audio/webm',
  'audio/wav',
  'audio/mpeg',
  'video/webm',
  'video/mp4',
  'video/ogg',
];

const ensureDirectory = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const sanitizeFilename = (filename: string) => filename.replace(/[^a-zA-Z0-9._-]/g, '-');

const createStorage = (directory: string, prefix: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureDirectory(directory);
      cb(null, directory);
    },
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${prefix}-${sanitizeFilename(path.basename(file.originalname))}`);
    },
  });

const createUploader = (directory: string, allowedMimeTypes: string[], fileSize: number, invalidTypeMessage: string) =>
  multer({
    storage: createStorage(directory, path.basename(directory)),
    limits: {
      fileSize,
    },
    fileFilter: (_req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
        return;
      }

      cb(new Error(invalidTypeMessage));
    },
  });

export const avatarUploadsDir = path.join(config.uploadsDir, 'avatars');
export const recordingUploadsDir = path.join(config.uploadsDir, 'recordings');

export const avatarUpload = createUploader(
  avatarUploadsDir,
  avatarMimeTypes,
  10 * 1024 * 1024,
  'Invalid file type. Only image files are allowed.'
);

export const recordingUpload = createUploader(
  recordingUploadsDir,
  recordingMimeTypes,
  50 * 1024 * 1024,
  'Invalid file type. Only audio and video files are allowed.'
);

export const buildAvatarUrl = (req: Request, filename: string) => (
  `${req.protocol}://${req.get('host')}/uploads/avatars/${filename}`
);

export const buildRecordingStoragePath = (filename: string) => path.posix.join('recordings', filename);

export const getRecordingAbsolutePath = (storagePath: string) => path.join(config.uploadsDir, storagePath);
