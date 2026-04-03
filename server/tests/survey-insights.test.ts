import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

const bearer = `Bearer ${jwt.sign({ userId: 'owner-1' }, process.env.JWT_SECRET as string)}`;

const survey = {
  id: 'survey-1',
  publicCode: 'public-1',
  isPublished: true,
  userId: 'owner-1',
  teamId: null,
  questions: [
    { id: 'q-1', text: 'First question' },
    { id: 'q-2', text: 'Second question' },
  ],
};

vi.mock('../src/prisma.js', () => ({
  prisma: {
    survey: {
      findUnique: vi.fn(),
    },
    surveyInsightEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    surveyResponse: {
      count: vi.fn(),
    },
    teamMember: {
      findFirst: vi.fn(),
    },
  },
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

describe('survey insights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('records public insight events for published surveys', async () => {
    vi.mocked(prisma.survey.findUnique).mockResolvedValue(survey as never);
    vi.mocked(prisma.surveyInsightEvent.create).mockResolvedValue({
      id: 'event-1',
    } as never);

    const res = await request(app)
      .post('/api/surveys/public/public-1/insights')
      .send({
        sessionId: 'session-1',
        eventType: 'form_view',
        pageIndex: 1,
      });

    expect(res.status).toBe(204);
    expect(vi.mocked(prisma.surveyInsightEvent.create)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          surveyId: survey.id,
          sessionId: 'session-1',
          eventType: 'form_view',
          pageIndex: 1,
        }),
      }),
    );
  });

  it('rejects unsupported public insight event types before persisting them', async () => {
    vi.mocked(prisma.survey.findUnique).mockResolvedValue(survey as never);

    const res = await request(app)
      .post('/api/surveys/public/public-1/insights')
      .send({
        sessionId: 'session-1',
        eventType: 'something_else',
      });

    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.surveyInsightEvent.create)).not.toHaveBeenCalled();
  });

  it('aggregates visits, starts, submissions, and question drop-off', async () => {
    vi.mocked(prisma.survey.findUnique).mockResolvedValue(survey as never);
    vi.mocked(prisma.surveyInsightEvent.findMany).mockResolvedValue([
      {
        id: 'e-1',
        sessionId: 's-1',
        eventType: 'form_view',
        questionId: null,
        createdAt: new Date('2026-04-01T10:00:00.000Z'),
      },
      {
        id: 'e-2',
        sessionId: 's-1',
        eventType: 'form_start',
        questionId: null,
        createdAt: new Date('2026-04-01T10:01:00.000Z'),
      },
      {
        id: 'e-3',
        sessionId: 's-1',
        eventType: 'question_reached',
        questionId: 'q-1',
        createdAt: new Date('2026-04-01T10:02:00.000Z'),
      },
      {
        id: 'e-4',
        sessionId: 's-2',
        eventType: 'form_view',
        questionId: null,
        createdAt: new Date('2026-04-01T10:03:00.000Z'),
      },
      {
        id: 'e-5',
        sessionId: 's-2',
        eventType: 'form_start',
        questionId: null,
        createdAt: new Date('2026-04-01T10:04:00.000Z'),
      },
      {
        id: 'e-6',
        sessionId: 's-2',
        eventType: 'question_reached',
        questionId: 'q-2',
        createdAt: new Date('2026-04-01T10:05:00.000Z'),
      },
    ] as never);
    vi.mocked(prisma.surveyResponse.count).mockResolvedValue(1 as never);

    const res = await request(app)
      .get('/api/surveys/survey-1/insights')
      .set('Authorization', bearer);

    expect(res.status).toBe(200);
    expect(res.body.overview.views).toBe(2);
    expect(res.body.overview.starts).toBe(2);
    expect(res.body.overview.submissions).toBe(1);
    expect(res.body.overview.conversionRate).toBe(50);
    expect(res.body.questionDropOff).toEqual([
      expect.objectContaining({
        questionId: 'q-1',
        reachedCount: 1,
        dropOffCount: 1,
      }),
      expect.objectContaining({
        questionId: 'q-2',
        reachedCount: 1,
        dropOffCount: 0,
      }),
    ]);
  });
});
