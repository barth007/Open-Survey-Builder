import request from 'supertest';
import { describe, expect, it } from 'vitest';
import './setup.js';

import { app } from '../src/app.js';

describe('security headers', () => {
  it('sets baseline hardening headers and hides framework fingerprinting', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });
});
