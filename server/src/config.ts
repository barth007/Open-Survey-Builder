import dotenv from 'dotenv';
import path from 'path';
import { createSystemCapabilities } from './capabilities.js';

dotenv.config();

const defaultAllowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'];

const readRequiredEnv = (env: NodeJS.ProcessEnv, key: 'DATABASE_URL' | 'JWT_SECRET') => {
  const value = env[key]?.trim();

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
};

const parseAllowedOrigins = (env: NodeJS.ProcessEnv) => {
  const configuredOrigins = env.ALLOWED_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins && configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  if (env.FRONTEND_URL?.trim()) {
    return [env.FRONTEND_URL.trim()];
  }

  return env.NODE_ENV === 'production' ? [] : defaultAllowedOrigins;
};

export const createConfig = (env: NodeJS.ProcessEnv = process.env) => ({
  port: env.PORT?.trim() || '3001',
  databaseUrl: readRequiredEnv(env, 'DATABASE_URL'),
  jwtSecret: readRequiredEnv(env, 'JWT_SECRET'),
  frontendUrl: env.FRONTEND_URL?.trim(),
  allowedOrigins: parseAllowedOrigins(env),
  uploadsDir: env.UPLOADS_DIR?.trim() || path.join(process.cwd(), 'uploads'),
  capabilities: createSystemCapabilities(env),
  smtp: {
    host: env.SMTP_HOST?.trim() || '',
    port: parseInt(env.SMTP_PORT?.trim() || '587', 10),
    secure: env.SMTP_SECURE === 'true',
    user: env.SMTP_USER?.trim() || '',
    pass: env.SMTP_PASS?.trim() || '',
    from: env.SMTP_FROM?.trim() || 'noreply@localhost',
  },
});

export const config = createConfig();
