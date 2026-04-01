import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

const unpublishedSurvey = {
  id: 'survey-1',
  publicCode: 'public-1',
  isPublished: false,
  name: 'Draft survey',
  description: 'A survey that is not published yet',
  questions: [],
  userId: 'owner-1',
};

vi.mock('../src/prisma.js', () => ({
  prisma: {
    survey: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    surveyResponse: {
      create: vi.fn(),
    },
  },
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

describe('public survey access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not expose unpublished surveys through preview=true', async () => {
    vi.mocked(prisma.survey.findUnique).mockResolvedValue(unpublishedSurvey as never);

    const res = await request(app).get('/api/surveys/public/public-1?preview=true');

    expect(res.status).toBe(404);
    expect(vi.mocked(prisma.survey.findUnique)).toHaveBeenCalledWith({
      where: { publicCode: unpublishedSurvey.publicCode },
    });
  });

  it('rejects public submission to unpublished surveys', async () => {
    vi.mocked(prisma.survey.findUnique).mockResolvedValue(unpublishedSurvey as never);

    const res = await request(app).post('/api/surveys/respond').send({
      surveyId: unpublishedSurvey.id,
      answers: [],
    });

    expect(res.status).toBe(403);
  });
});
