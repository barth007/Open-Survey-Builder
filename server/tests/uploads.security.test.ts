import request from 'supertest';
import { describe, expect, it } from 'vitest';
import './setup.js';

import { app } from '../src/app.js';

describe('upload privacy', () => {
  it('does not serve recording files from a public static uploads route', async () => {
    const res = await request(app).get('/uploads/private-recording.webm');

    expect([401, 403, 404]).toContain(res.status);
  });
});
