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
});
