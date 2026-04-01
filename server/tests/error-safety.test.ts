import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

vi.mock('../src/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    team: {
      create: vi.fn(),
    },
    teamMember: {
      create: vi.fn(),
    },
    folder: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

const bearer = `Bearer ${jwt.sign({ userId: 'user-1' }, process.env.JWT_SECRET as string)}`;

describe('error safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not return raw jwt verification details to clients', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer bad-token');

    expect(res.status).toBe(401);
    expect(res.body.error).toBeUndefined();
  });

  it('does not serialize raw controller errors in auth responses', async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('database exploded') as never);

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', bearer);

    expect(res.status).toBe(500);
    expect(res.body.error).toBeUndefined();
  });

  it('persists team descriptions when creating teams', async () => {
    vi.mocked(prisma.team.create).mockResolvedValue({
      id: 'team-1',
      name: 'Product',
      description: 'Survey owners',
    } as never);
    vi.mocked(prisma.teamMember.create).mockResolvedValue({
      id: 'membership-1',
      teamId: 'team-1',
      userId: 'user-1',
      role: 'owner',
    } as never);

    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', bearer)
      .send({
        name: 'Product',
        description: 'Survey owners',
      });

    expect(res.status).toBe(201);
    expect(vi.mocked(prisma.team.create)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          description: 'Survey owners',
        }),
      }),
    );
  });

  it('returns the updated folder payload instead of stale folder data', async () => {
    vi.mocked(prisma.folder.findUnique).mockResolvedValue({
      id: 'folder-1',
      userId: 'user-1',
      name: 'Old name',
      order: 1,
    } as never);
    vi.mocked(prisma.folder.update).mockResolvedValue({
      id: 'folder-1',
      userId: 'user-1',
      name: 'New name',
      order: 3,
    } as never);

    const res = await request(app)
      .put('/api/surveys/folders/folder-1')
      .set('Authorization', bearer)
      .send({
        name: 'New name',
        order: 3,
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New name');
    expect(res.body.order).toBe(3);
  });
});
