import request from 'supertest';
import { describe, expect, it } from 'vitest';
import './setup.js';
import { app } from '../src/app.js';

describe('health route', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
