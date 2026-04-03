import fs from 'fs';
import multer from 'multer';
import path from 'path';
import type { Request } from 'express';
import { config } from './config.js';

const avatarMimeTypes = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
} as const;

const recordingMimeTypes = {
  'audio/ogg': '.ogg',
  'audio/webm': '.webm',
  'audio/wav': '.wav',
  'audio/mpeg': '.mp3',
  'video/webm': '.webm',
  'video/mp4': '.mp4',
  'video/ogg': '.ogg',
} as const;

const ensureDirectory = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const sanitizeFilename = (filename: string) => filename.replace(/[^a-zA-Z0-9._-]/g, '-');

const createStorage = (
  directory: string,
  prefix: string,
  extensionByMimeType: Record<string, string>,
) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureDirectory(directory);
      cb(null, directory);
    },
    filename: (_req, file, cb) => {
      const safeExtension = extensionByMimeType[file.mimetype] || path.extname(file.originalname).toLowerCase();
      const baseName = path.basename(file.originalname, path.extname(file.originalname));

      cb(
        null,
        `${Date.now()}-${prefix}-${sanitizeFilename(baseName)}${safeExtension}`,
      );
    },
  });

const createUploader = (
  directory: string,
  allowedMimeTypes: Record<string, string>,
  fileSize: number,
  invalidTypeMessage: string,
) =>
  multer({
    storage: createStorage(directory, path.basename(directory), allowedMimeTypes),
    limits: {
      fileSize,
    },
    fileFilter: (_req, file, cb) => {
      if (Object.prototype.hasOwnProperty.call(allowedMimeTypes, file.mimetype)) {
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
  `/uploads/avatars/${filename}`
);

export const buildRecordingStoragePath = (filename: string) => path.posix.join('recordings', filename);

export const getRecordingAbsolutePath = (storagePath: string) => path.join(config.uploadsDir, storagePath);
