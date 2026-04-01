import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

const ownerUserId = 'owner-1';
const teamId = 'team-1';
const bearer = `Bearer ${jwt.sign({ userId: ownerUserId }, process.env.JWT_SECRET as string)}`;

vi.mock('../src/prisma.js', () => ({
  prisma: {
    teamMember: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

describe('team owner invariants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prevents self-demotion for the last owner', async () => {
    vi.mocked(prisma.teamMember.findFirst)
      .mockResolvedValueOnce({
        id: 'membership-requester',
        teamId,
        userId: ownerUserId,
        role: 'owner',
      } as never)
      .mockResolvedValueOnce({
        id: 'membership-owner',
        teamId,
        userId: ownerUserId,
        role: 'owner',
      } as never);
    vi.mocked(prisma.teamMember.count).mockResolvedValue(1 as never);

    const res = await request(app)
      .put(`/api/teams/${teamId}/members/${ownerUserId}`)
      .set('Authorization', bearer)
      .send({ role: 'member' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Cannot demote the last team owner');
    expect(vi.mocked(prisma.teamMember.update)).not.toHaveBeenCalled();
  });

  it('prevents the last owner from removing themselves', async () => {
    vi.mocked(prisma.teamMember.findFirst)
      .mockResolvedValueOnce({
        id: 'membership-requester',
        teamId,
        userId: ownerUserId,
        role: 'owner',
      } as never)
      .mockResolvedValueOnce({
        id: 'membership-owner',
        teamId,
        userId: ownerUserId,
        role: 'owner',
      } as never);
    vi.mocked(prisma.teamMember.count).mockResolvedValue(1 as never);

    const res = await request(app)
      .delete(`/api/teams/${teamId}/members/${ownerUserId}`)
      .set('Authorization', bearer);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Cannot remove the last team owner');
    expect(vi.mocked(prisma.teamMember.delete)).not.toHaveBeenCalled();
  });

  it('rejects invalid role transitions through the generic role endpoint', async () => {
    const res = await request(app)
      .put(`/api/teams/${teamId}/members/member-2`)
      .set('Authorization', bearer)
      .send({ role: 'owner' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Role must be admin or member');
  });
});
