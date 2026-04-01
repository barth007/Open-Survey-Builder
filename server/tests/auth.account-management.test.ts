import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

vi.mock('../src/prisma.js', () => ({
  prisma: {
    $transaction: vi.fn(),
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    survey: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    folder: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    teamMember: {
      findMany: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
    teamInvitation: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    surveyResponse: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('new-password-hash'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

import bcrypt from 'bcryptjs';
import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

const bearer = `Bearer ${jwt.sign({ userId: 'user-1' }, process.env.JWT_SECRET as string)}`;

const mockProfile = {
  id: 'user-1',
  email: 'owner@example.com',
  name: 'Owner',
  avatarUrl: null,
  emailNotifications: true,
  marketingEmails: false,
  role: 'user',
  status: 'approved',
  updatedAt: '2026-03-26T00:00:00.000Z',
};

describe('auth account management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockImplementation(async (operations: Promise<unknown>[]) => Promise.all(operations) as never);
  });

  it('persists notification preferences through profile updates', async () => {
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...mockProfile,
      emailNotifications: false,
      marketingEmails: true,
    } as never);

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', bearer)
      .send({
        emailNotifications: false,
        marketingEmails: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.emailNotifications).toBe(false);
    expect(res.body.marketingEmails).toBe(true);
    expect(vi.mocked(prisma.user.update)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          emailNotifications: false,
          marketingEmails: true,
        }),
      }),
    );
  });

  it('requires the current password before changing passwords', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      passwordHash: 'stored-hash',
    } as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const res = await request(app)
      .post('/api/auth/password')
      .set('Authorization', bearer)
      .send({
        currentPassword: 'wrong-password',
        password: 'new-password',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Current password is incorrect');
    expect(vi.mocked(prisma.user.update)).not.toHaveBeenCalled();
  });

  it('exports account data as a single JSON payload', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockProfile as never);
    vi.mocked(prisma.survey.findMany).mockResolvedValue([
      { id: 'survey-1', name: 'Survey One' },
    ] as never);
    vi.mocked(prisma.folder.findMany).mockResolvedValue([
      { id: 'folder-1', name: 'Folder One' },
    ] as never);
    vi.mocked(prisma.teamMember.findMany).mockResolvedValue([
      { id: 'membership-1', role: 'member', team: { id: 'team-1', name: 'Team One' } },
    ] as never);
    vi.mocked(prisma.teamInvitation.findMany).mockResolvedValue([
      { id: 'invitation-1', email: mockProfile.email, team: { id: 'team-1', name: 'Team One' } },
    ] as never);
    vi.mocked(prisma.surveyResponse.findMany).mockResolvedValue([
      { id: 'response-1', surveyId: 'survey-2' },
    ] as never);

    const res = await request(app)
      .get('/api/auth/export')
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(mockProfile.email);
    expect(res.body.surveys).toHaveLength(1);
    expect(res.body.folders).toHaveLength(1);
    expect(res.body.teamMemberships).toHaveLength(1);
    expect(res.body.invitations).toHaveLength(1);
    expect(res.body.responses).toHaveLength(1);
  });

  it('blocks account deletion when the user is the last owner of a team', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: mockProfile.email,
      passwordHash: 'stored-hash',
    } as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(prisma.teamMember.findMany).mockResolvedValue([
      { teamId: 'team-1' },
    ] as never);
    vi.mocked(prisma.teamMember.count).mockResolvedValue(1 as never);

    const res = await request(app)
      .delete('/api/auth/profile')
      .set('Authorization', bearer)
      .send({
        currentPassword: 'secret123',
        confirmation: 'DELETE',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Transfer team ownership before deleting this account');
    expect(vi.mocked(prisma.user.delete)).not.toHaveBeenCalled();
  });

  it('deletes the account after validation when no owner transfer is required', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: mockProfile.email,
      passwordHash: 'stored-hash',
    } as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(prisma.teamMember.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.surveyResponse.deleteMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(prisma.teamInvitation.deleteMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(prisma.survey.deleteMany).mockResolvedValue({ count: 2 } as never);
    vi.mocked(prisma.folder.deleteMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(prisma.teamMember.deleteMany).mockResolvedValue({ count: 0 } as never);
    vi.mocked(prisma.user.delete).mockResolvedValue({ id: 'user-1' } as never);

    const res = await request(app)
      .delete('/api/auth/profile')
      .set('Authorization', bearer)
      .send({
        currentPassword: 'secret123',
        confirmation: 'DELETE',
      });

    expect(res.status).toBe(204);
    expect(vi.mocked(prisma.user.delete)).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });
  });
});
