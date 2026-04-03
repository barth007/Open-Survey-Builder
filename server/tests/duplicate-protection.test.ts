import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

const surveyWithHiddenFieldProtection = {
  id: 'survey-1',
  isPublished: true,
  userId: 'owner-1',
  teamId: null,
  settings: {
    access: {
      duplicateProtection: {
        enabled: true,
        uniqueFieldRef: 'hidden:lead_id',
        appliesTo: 'submitted',
      },
    },
  },
};

vi.mock('../src/prisma.js', () => ({
  prisma: {
    survey: {
      findUnique: vi.fn(),
    },
    surveyResponse: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    teamMember: {
      findFirst: vi.fn(),
    },
  },
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

describe('duplicate protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks duplicate submissions using a hidden field reference', async () => {
    vi.mocked(prisma.survey.findUnique).mockResolvedValue(surveyWithHiddenFieldProtection as never);
    vi.mocked(prisma.surveyResponse.findMany).mockResolvedValue([
      {
        id: 'response-1',
        status: 'submitted',
        answers: [],
        metadata: {
          hiddenFields: {
            lead_id: 'lead-123',
          },
        },
      },
    ] as never);

    const res = await request(app)
      .post('/api/surveys/respond')
      .send({
        surveyId: 'survey-1',
        answers: [],
        metadata: {
          hiddenFields: {
            lead_id: 'lead-123',
          },
        },
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Duplicate submission prevented');
    expect(vi.mocked(prisma.surveyResponse.create)).not.toHaveBeenCalled();
  });

  it('can include draft responses when appliesTo is submitted_and_partial', async () => {
    vi.mocked(prisma.survey.findUnique).mockResolvedValue({
      ...surveyWithHiddenFieldProtection,
      settings: {
        access: {
          duplicateProtection: {
            enabled: true,
            uniqueFieldRef: 'question:q-email',
            appliesTo: 'submitted_and_partial',
          },
        },
      },
    } as never);
    vi.mocked(prisma.surveyResponse.findMany).mockResolvedValue([
      {
        id: 'response-2',
        status: 'draft',
        answers: [
          {
            questionId: 'q-email',
            value: 'alice@example.com',
          },
        ],
        metadata: {},
      },
    ] as never);

    const res = await request(app)
      .post('/api/surveys/respond')
      .send({
        surveyId: 'survey-1',
        answers: [
          {
            questionId: 'q-email',
            value: 'alice@example.com',
          },
        ],
        metadata: {},
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Duplicate submission prevented');
  });
});
