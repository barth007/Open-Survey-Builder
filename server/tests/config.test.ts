import { describe, expect, it } from 'vitest';
import './setup.js';

import { createConfig } from '../src/config.js';

describe('config', () => {
  it('requires a jwt secret', () => {
    expect(() => createConfig({
      PORT: '3001',
      DATABASE_URL: 'postgresql://db',
    })).toThrow('JWT_SECRET is required');
  });

  it('requires a database url', () => {
    expect(() => createConfig({
      PORT: '3001',
      JWT_SECRET: 'secret',
    })).toThrow('DATABASE_URL is required');
  });

  it('builds a production-safe config from explicit env', () => {
    const config = createConfig({
      PORT: '3001',
      DATABASE_URL: 'postgresql://db',
      JWT_SECRET: 'secret',
      FRONTEND_URL: 'https://app.example.com',
    });

    expect(config.port).toBe('3001');
    expect(config.databaseUrl).toBe('postgresql://db');
    expect(config.jwtSecret).toBe('secret');
    expect(config.allowedOrigins).toEqual(['https://app.example.com']);
  });
});
