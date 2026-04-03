import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import './setup.js';

import { app } from '../src/app.js';

const bearer = `Bearer ${jwt.sign({ userId: 'user-1' }, process.env.JWT_SECRET as string)}`;

describe('avatar uploads', () => {
  it('accepts image uploads on the avatar route', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', bearer)
      .attach('file', Buffer.from('img'), {
        filename: 'avatar.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(200);
    expect(typeof res.body.url).toBe('string');
    expect(res.body.url).toContain('/uploads/avatars/');
  });

  it('rejects svg uploads on the avatar route', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', bearer)
      .attach('file', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), {
        filename: 'avatar.svg',
        contentType: 'image/svg+xml',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid file type. Only image files are allowed.');
  });

  it('does not preserve unsafe original extensions for accepted image uploads', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', bearer)
      .attach('file', Buffer.from('img'), {
        filename: 'avatar.html',
        contentType: 'image/png',
      });

    expect(res.status).toBe(200);
    expect(res.body.url).toContain('/uploads/avatars/');
    expect(res.body.url.endsWith('.html')).toBe(false);
    expect(res.body.url.endsWith('.png')).toBe(true);
  });

  it('rate limits repeated avatar uploads from the same client', async () => {
    let lastResponse;

    for (let attempt = 0; attempt < 11; attempt += 1) {
      lastResponse = await request(app)
        .post('/api/upload')
        .set('Authorization', bearer)
        .attach('file', Buffer.from('img'), {
          filename: `avatar-${attempt}.png`,
          contentType: 'image/png',
        });
    }

    expect(lastResponse?.status).toBe(429);
    expect(lastResponse?.body.message).toBe('Too many requests');
  });
});
