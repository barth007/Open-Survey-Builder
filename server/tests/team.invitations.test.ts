import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

const currentUser = {
  id: 'user-1',
  email: 'me@example.com',
};

vi.mock('../src/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    teamInvitation: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    teamMember: {
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

const bearer = `Bearer ${jwt.sign({ userId: currentUser.id }, process.env.JWT_SECRET as string)}`;

describe('team invitation security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('derives invitation lookup from the authenticated user instead of req.query.email', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(currentUser as never);
    vi.mocked(prisma.teamInvitation.findMany).mockResolvedValue([
      {
        id: 'invite-1',
        teamId: 'team-1',
        email: currentUser.email,
        createdAt: new Date('2026-03-01T12:00:00.000Z'),
        expiresAt: new Date('2026-04-01T12:00:00.000Z'),
        invitationCode: 'invite-code',
        status: 'pending',
        team: {
          id: 'team-1',
          name: 'Growth',
          description: 'Team',
          createdAt: new Date('2026-01-01T12:00:00.000Z'),
          members: [{ userId: 'owner-1' }],
        },
      },
    ] as never);

    const res = await request(app)
      .get('/api/invitations?email=other@example.com')
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body.every((invitation: { email: string }) => invitation.email === currentUser.email)).toBe(true);
    expect(vi.mocked(prisma.teamInvitation.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          email: currentUser.email,
        }),
      })
    );
  });

  it('rejects expired invitations on accept', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(currentUser as never);
    vi.mocked(prisma.teamInvitation.findUnique).mockResolvedValue({
      id: 'invite-expired',
      teamId: 'team-1',
      email: currentUser.email,
      status: 'pending',
      expiresAt: new Date('2026-03-01T12:00:00.000Z'),
    } as never);

    const res = await request(app)
      .post('/api/invitations/invite-expired/accept')
      .set('Authorization', bearer);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invitation has expired');
  });

  it('rejects duplicate pending invitations for the same team and email', async () => {
    vi.mocked(prisma.teamMember.findFirst).mockResolvedValueOnce({
      id: 'membership-1',
      teamId: 'team-1',
      userId: currentUser.id,
      role: 'owner',
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.teamInvitation.findFirst).mockResolvedValue({
      id: 'invite-1',
      teamId: 'team-1',
      email: 'invitee@example.com',
      status: 'pending',
      expiresAt: new Date('2026-04-01T12:00:00.000Z'),
    } as never);

    const res = await request(app)
      .post('/api/teams/team-1/invitations')
      .set('Authorization', bearer)
      .send({ email: 'invitee@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('A pending invitation already exists for this email');
  });

  it('accepts invitations case-insensitively against the authenticated user email', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...currentUser,
      email: 'Me@Example.com',
    } as never);
    vi.mocked(prisma.teamInvitation.findUnique).mockResolvedValue({
      id: 'invite-1',
      teamId: 'team-1',
      email: 'me@example.com',
      role: 'member',
      status: 'pending',
      expiresAt: new Date('2026-04-01T12:00:00.000Z'),
    } as never);
    vi.mocked(prisma.teamMember.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.teamInvitation.update).mockResolvedValue({
      id: 'invite-1',
      status: 'accepted',
    } as never);
    vi.mocked(prisma.teamMember.create).mockResolvedValue({
      id: 'membership-1',
      teamId: 'team-1',
      userId: currentUser.id,
      role: 'member',
    } as never);

    const res = await request(app)
      .post('/api/invitations/invite-1/accept')
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ teamId: 'team-1' });
  });
});
