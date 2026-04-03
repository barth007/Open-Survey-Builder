import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

const mockUser = {
  id: 'user-1',
  email: 'pending@example.com',
  name: 'Pending User',
  passwordHash: 'hashed-password',
  role: 'user',
  status: 'pending',
};

vi.mock('../src/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('token'),
  },
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

describe('auth security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not expose the mock google login route', async () => {
    const res = await request(app).post('/api/auth/google');

    expect([404, 403, 501]).toContain(res.status);
  });

  it('rejects login for pending users', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

    const res = await request(app).post('/api/auth/login').send({
      email: mockUser.email,
      password: 'secret123',
    });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Account pending approval');
  });

  it('creates new accounts as pending', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.user.create).mockResolvedValue({
      ...mockUser,
      email: 'new@example.com',
      name: 'New User',
    } as never);

    const res = await request(app).post('/api/auth/register').send({
      email: 'New@Example.com',
      password: 'secret123',
      name: 'New User',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeUndefined();
    expect(res.body.user.status).toBe('pending');
    expect(res.body.user.role).toBe('user');
    expect(vi.mocked(prisma.user.create)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'new@example.com',
          status: 'pending',
        }),
      })
    );
  });

  it('normalizes login email lookups to lowercase', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...mockUser,
      status: 'approved',
      email: 'pending@example.com',
    } as never);

    const res = await request(app).post('/api/auth/login').send({
      email: 'Pending@Example.com',
      password: 'secret123',
    });

    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.user.findUnique)).toHaveBeenCalledWith({
      where: { email: 'pending@example.com' },
    });
  });

  it('rate limits repeated failed login attempts from the same client', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

    let lastResponse;

    for (let attempt = 0; attempt < 11; attempt += 1) {
      lastResponse = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'wrong-password',
      });
    }

    expect(lastResponse?.status).toBe(429);
    expect(lastResponse?.body.message).toBe('Too many requests');
  });
});
