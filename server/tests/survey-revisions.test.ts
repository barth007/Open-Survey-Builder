import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

const bearer = `Bearer ${jwt.sign({ userId: 'owner-1' }, process.env.JWT_SECRET as string)}`;

const baseSurvey = {
  id: 'survey-1',
  name: 'Hiring survey',
  description: 'Initial description',
  questions: [],
  isPublished: true,
  publicCode: 'public-1',
  userId: 'owner-1',
  teamId: null,
  folderId: null,
  appearance: null,
  branding: null,
  shareMeta: null,
  seo: null,
  settings: null,
  notifications: null,
  retention: null,
  hiddenFields: null,
  computedFields: null,
  automationRules: null,
  delivery: null,
  welcomeTitle: null,
  welcomeMessage: null,
  welcomeInstructions: null,
  welcomeButtonText: null,
  thankYouTitle: null,
  thankYouMessage: null,
  thankYouButtonText: null,
  redirectUrl: null,
  recordingEnabled: false,
  recordingRequired: false,
};

vi.mock('../src/prisma.js', () => ({
  prisma: {
    survey: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    surveyRevision: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    teamMember: {
      findFirst: vi.fn(),
    },
  },
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

describe('survey revisions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a revision snapshot when a survey is updated', async () => {
    vi.mocked(prisma.survey.findUnique).mockResolvedValue(baseSurvey as never);
    vi.mocked(prisma.survey.update).mockResolvedValue({
      ...baseSurvey,
      name: 'Hiring survey v2',
      description: 'Updated description',
    } as never);
    vi.mocked(prisma.surveyRevision.create).mockResolvedValue({
      id: 'revision-1',
    } as never);

    const res = await request(app)
      .put('/api/surveys/survey-1')
      .set('Authorization', bearer)
      .send({
        name: 'Hiring survey v2',
        description: 'Updated description',
      });

    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.surveyRevision.create)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          surveyId: baseSurvey.id,
          snapshot: expect.objectContaining({
            name: 'Hiring survey v2',
            description: 'Updated description',
          }),
        }),
      }),
    );
  });

  it('lists revisions and restores one into draft mode', async () => {
    vi.mocked(prisma.survey.findUnique)
      .mockResolvedValueOnce(baseSurvey as never)
      .mockResolvedValueOnce(baseSurvey as never)
      .mockResolvedValueOnce(baseSurvey as never);
    vi.mocked(prisma.surveyRevision.findMany).mockResolvedValue([
      {
        id: 'revision-1',
        surveyId: baseSurvey.id,
        label: 'Hiring survey',
        createdAt: new Date('2026-04-01T18:00:00.000Z'),
        restoredAt: null,
        snapshot: {
          ...baseSurvey,
          name: 'Hiring survey snapshot',
          isPublished: true,
        },
      },
    ] as never);
    vi.mocked(prisma.surveyRevision.findUnique).mockResolvedValue({
      id: 'revision-1',
      surveyId: baseSurvey.id,
      snapshot: {
        ...baseSurvey,
        name: 'Hiring survey snapshot',
        isPublished: true,
      },
    } as never);
    vi.mocked(prisma.survey.update).mockResolvedValue({
      ...baseSurvey,
      name: 'Hiring survey snapshot',
      isPublished: false,
    } as never);
    vi.mocked(prisma.surveyRevision.update).mockResolvedValue({
      id: 'revision-1',
      restoredAt: new Date(),
    } as never);

    const listRes = await request(app)
      .get('/api/surveys/survey-1/revisions')
      .set('Authorization', bearer);

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);

    const restoreRes = await request(app)
      .post('/api/surveys/survey-1/revisions/revision-1/restore')
      .set('Authorization', bearer)
      .send({});

    expect(restoreRes.status).toBe(200);
    expect(vi.mocked(prisma.survey.update)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: baseSurvey.id },
        data: expect.objectContaining({
          name: 'Hiring survey snapshot',
          isPublished: false,
        }),
      }),
    );
  });
});
