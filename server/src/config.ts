import dotenv from 'dotenv';
import path from 'path';
import { createSystemCapabilities } from './capabilities.js';

dotenv.config();

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
];
const knownWeakJwtSecrets = new Set([
  'change-me-to-a-long-random-string',
  'your-super-secret-jwt-key-replace-in-production',
  'secret',
]);

const readRequiredEnv = (env: NodeJS.ProcessEnv, key: 'DATABASE_URL' | 'JWT_SECRET') => {
  const value = env[key]?.trim();

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
};

const validateJwtSecret = (env: NodeJS.ProcessEnv) => {
  const value = readRequiredEnv(env, 'JWT_SECRET');
  const isProduction = env.NODE_ENV === 'production';

  if (
    isProduction
    && (value.length < 32 || knownWeakJwtSecrets.has(value))
  ) {
    throw new Error('JWT_SECRET must be at least 32 characters long and not use a known placeholder in production');
  }

  return value;
};

const parseAllowedOrigins = (env: NodeJS.ProcessEnv) => {
  const isProduction = env.NODE_ENV === 'production';
  const configuredOrigins = env.ALLOWED_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins && configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  const origins = new Set<string>();

  if (env.FRONTEND_URL?.trim()) {
    const frontendUrl = env.FRONTEND_URL.trim();
    origins.add(frontendUrl);

    // Automatically add 127.0.0.1 if localhost is used, and vice versa
    if (frontendUrl.includes('localhost')) {
      origins.add(frontendUrl.replace('localhost', '127.0.0.1'));
    } else if (frontendUrl.includes('127.0.0.1')) {
      origins.add(frontendUrl.replace('127.0.0.1', 'localhost'));
    }
  }

  if (!isProduction) {
    defaultAllowedOrigins.forEach((o) => origins.add(o));
  }

  return Array.from(origins);
};

export const createConfig = (env: NodeJS.ProcessEnv = process.env) => ({
  port: env.PORT?.trim() || '3001',
  databaseUrl: readRequiredEnv(env, 'DATABASE_URL'),
  jwtSecret: validateJwtSecret(env),
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
