import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

vi.mock('../src/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    team: {
      create: vi.fn(),
      update: vi.fn(),
    },
    teamMember: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    folder: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

const bearer = `Bearer ${jwt.sign({ userId: 'user-1' }, process.env.JWT_SECRET as string)}`;

describe('input validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid registration emails before hitting the database', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: 'secret123',
        name: 'User',
      });

    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.user.findUnique)).not.toHaveBeenCalled();
    expect(vi.mocked(prisma.user.create)).not.toHaveBeenCalled();
  });

  it('rejects bcrypt-truncating registration passwords longer than 72 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@example.com',
        password: 'a'.repeat(73),
        name: 'User',
      });

    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.user.findUnique)).not.toHaveBeenCalled();
    expect(vi.mocked(prisma.user.create)).not.toHaveBeenCalled();
  });

  it('rejects malformed login payloads before lookup', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'bad-email',
        password: 'secret123',
      });

    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.user.findUnique)).not.toHaveBeenCalled();
  });

  it('rejects empty profile updates', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', bearer)
      .send({});

    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.user.update)).not.toHaveBeenCalled();
  });

  it('rejects invalid admin profile status transitions before database access', async () => {
    const res = await request(app)
      .put('/api/auth/admin/profiles/user-2')
      .set('Authorization', bearer)
      .send({
        status: 'admin',
      });

    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.user.findUnique)).not.toHaveBeenCalled();
    expect(vi.mocked(prisma.user.update)).not.toHaveBeenCalled();
  });

  it('rejects team creation with an empty name', async () => {
    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', bearer)
      .send({
        name: '   ',
        description: 'Product',
      });

    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.team.create)).not.toHaveBeenCalled();
  });

  it('rejects empty team updates before membership lookup', async () => {
    const res = await request(app)
      .put('/api/teams/team-1')
      .set('Authorization', bearer)
      .send({});

    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.teamMember.findFirst)).not.toHaveBeenCalled();
    expect(vi.mocked(prisma.team.update)).not.toHaveBeenCalled();
  });

  it('rejects folder creation with a negative order', async () => {
    const res = await request(app)
      .post('/api/surveys/folders')
      .set('Authorization', bearer)
      .send({
        name: 'Inbox',
        order: -1,
      });

    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.folder.create)).not.toHaveBeenCalled();
  });

  it('rejects empty folder updates before loading the folder', async () => {
    const res = await request(app)
      .put('/api/surveys/folders/folder-1')
      .set('Authorization', bearer)
      .send({});

    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.folder.findUnique)).not.toHaveBeenCalled();
    expect(vi.mocked(prisma.folder.update)).not.toHaveBeenCalled();
  });
});
