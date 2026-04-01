import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

const userId = 'user-1';
const bearer = `Bearer ${jwt.sign({ userId }, process.env.JWT_SECRET as string)}`;

vi.mock('../src/prisma.js', () => ({
  prisma: {
    survey: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    teamMember: {
      findFirst: vi.fn(),
    },
    folder: {
      findUnique: vi.fn(),
    },
  },
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

describe('survey ownership validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects survey creation into a team the caller does not belong to', async () => {
    vi.mocked(prisma.teamMember.findFirst).mockResolvedValue(null as never);

    const res = await request(app)
      .post('/api/surveys')
      .set('Authorization', bearer)
      .send({
        name: 'Unsafe',
        teamId: 'foreign-team',
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: You do not belong to this team');
    expect(vi.mocked(prisma.survey.create)).not.toHaveBeenCalled();
  });

  it('rejects survey updates that bind to a folder the caller does not own', async () => {
    vi.mocked(prisma.survey.findUnique).mockResolvedValue({
      id: 'survey-1',
      userId,
      teamId: null,
      folderId: null,
    } as never);
    vi.mocked(prisma.folder.findUnique).mockResolvedValue({
      id: 'folder-1',
      userId: 'other-user',
      teamId: null,
    } as never);

    const res = await request(app)
      .put('/api/surveys/survey-1')
      .set('Authorization', bearer)
      .send({
        folderId: 'folder-1',
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: You do not own this folder');
    expect(vi.mocked(prisma.survey.update)).not.toHaveBeenCalled();
  });

  it('lists team surveys for collaborators in the survey index', async () => {
    vi.mocked(prisma.survey.findMany).mockResolvedValue([
      {
        id: 'team-survey-1',
        name: 'Shared Research',
        userId: 'owner-2',
        teamId: 'team-1',
        folderId: null,
        isPublished: false,
        publicCode: null,
        description: '',
        questions: [],
        createdAt: new Date('2026-03-20T10:00:00.000Z'),
        updatedAt: new Date('2026-03-20T10:00:00.000Z'),
      },
    ] as never);

    const res = await request(app)
      .get('/api/surveys')
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe('team-survey-1');
    expect(vi.mocked(prisma.survey.findMany)).toHaveBeenCalledWith({
      where: {
        OR: [
          { userId },
          {
            team: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  });
});
