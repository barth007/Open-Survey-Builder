import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

const survey = {
  id: 'survey-1',
  publicCode: 'public-1',
  isPublished: true,
  userId: 'owner-1',
  teamId: null,
  name: 'Resume-ready survey',
  description: 'Stores in-progress answers',
  settings: {
    behavior: {
      capturePartialSubmissions: true,
    },
  },
  questions: [
    {
      id: 'q-name',
      type: 'text',
      text: 'Your name',
      isRequired: false,
      options: [],
    },
    {
      id: 'q-signature',
      type: 'signature',
      text: 'Signature',
      isRequired: false,
      options: [],
    },
  ],
};

const responseSession = {
  id: 'response-1',
  surveyId: survey.id,
  status: 'draft',
  participantId: null,
  participantEmail: null,
  answers: [],
  metadata: {},
  survey,
};

vi.mock('../src/prisma.js', () => ({
  prisma: {
    survey: {
      findUnique: vi.fn(),
    },
    surveyResponse: {
      create: vi.fn(),
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

const sessionToken = jwt.sign(
  {
    responseId: responseSession.id,
    surveyId: survey.id,
    scope: 'response-session',
  },
  process.env.JWT_SECRET as string,
);

describe('partial submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.survey.findUnique).mockResolvedValue(survey as never);
  });

  it('stores an in-progress checkpoint without persisting signature answers', async () => {
    vi.mocked(prisma.surveyResponse.findUnique).mockResolvedValue(responseSession as never);
    vi.mocked(prisma.surveyResponse.update).mockResolvedValue({
      id: responseSession.id,
      surveyId: survey.id,
      status: 'partial',
      answers: [{ questionId: 'q-name', value: 'Ada' }],
      metadata: { checkpointAt: '2026-04-01T19:20:00.000Z' },
    } as never);

    const res = await request(app)
      .post('/api/surveys/respond')
      .send({
        surveyId: survey.id,
        responseId: responseSession.id,
        sessionToken,
        submissionMode: 'partial',
        answers: [
          { questionId: 'q-name', value: 'Ada' },
          {
            questionId: 'q-signature',
            value: {
              kind: 'signature',
              dataUrl: 'data:image/png;base64,abc',
              signedAt: '2026-04-01T19:20:00.000Z',
            },
          },
        ],
        metadata: {
          checkpointAt: '2026-04-01T19:20:00.000Z',
        },
      });

    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.surveyResponse.update)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: responseSession.id },
        data: expect.objectContaining({
          status: 'partial',
          answers: [{ questionId: 'q-name', value: 'Ada' }],
        }),
      }),
    );
  });

  it('returns the saved partial response when the respondent resumes later', async () => {
    vi.mocked(prisma.surveyResponse.findUnique).mockResolvedValue({
      id: responseSession.id,
      surveyId: survey.id,
      status: 'partial',
      participantId: null,
      participantEmail: null,
      answers: [{ questionId: 'q-name', value: 'Ada' }],
      metadata: {
        hiddenFields: {
          lead_id: 'lead-42',
        },
      },
      survey,
    } as never);

    const res = await request(app)
      .get(`/api/surveys/respond/session/${responseSession.id}`)
      .set('x-response-session-token', sessionToken);

    expect(res.status).toBe(200);
    expect(res.body.responseId).toBe(responseSession.id);
    expect(res.body.status).toBe('partial');
    expect(res.body.answers).toEqual([{ questionId: 'q-name', value: 'Ada' }]);
    expect(res.body.metadata.hiddenFields).toEqual({ lead_id: 'lead-42' });
  });
});
