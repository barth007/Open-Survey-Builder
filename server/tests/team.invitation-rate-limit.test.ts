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
      findUnique: vi.fn(),
    },
    teamInvitation: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    teamMember: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('../src/mailer.js', () => ({
  sendInvitationEmail: vi.fn().mockResolvedValue(undefined),
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

const bearer = `Bearer ${jwt.sign({ userId: 'user-1' }, process.env.JWT_SECRET as string)}`;

describe('team invitation rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rate limits repeated invitation creation attempts from the same client', async () => {
    vi.mocked(prisma.teamMember.findFirst).mockResolvedValue({
      id: 'membership-1',
      teamId: 'team-1',
      userId: 'user-1',
      role: 'owner',
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.teamInvitation.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.teamInvitation.create).mockResolvedValue({
      id: 'invite-1',
      email: 'invitee@example.com',
      teamId: 'team-1',
      role: 'member',
      status: 'pending',
      invitationCode: 'code-1',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    } as never);
    vi.mocked(prisma.team.findUnique).mockResolvedValue({
      name: 'Growth',
    } as never);

    let lastResponse;

    for (let attempt = 0; attempt < 11; attempt += 1) {
      lastResponse = await request(app)
        .post('/api/teams/team-1/invitations')
        .set('Authorization', bearer)
        .send({
          email: `invitee+${attempt}@example.com`,
        });
    }

    expect(lastResponse?.status).toBe(429);
    expect(lastResponse?.body.message).toBe('Too many requests');
  });
});
