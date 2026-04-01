import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

const publishedSurvey = {
  id: 'survey-1',
  isPublished: true,
  userId: 'owner-1',
  teamId: null,
};

const draftResponse = {
  id: 'response-1',
  surveyId: publishedSurvey.id,
  status: 'draft',
  participantId: null,
  survey: publishedSurvey,
};

interface QuestionRecordingCreateArgs {
  data: {
    responseId: string;
    [key: string]: unknown;
  };
}

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
    questionRecording: {
      create: vi.fn(),
    },
    teamMember: {
      findFirst: vi.fn(),
    },
  },
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

describe('recording response sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a response session before accepting recording uploads', async () => {
    vi.mocked(prisma.survey.findUnique).mockResolvedValue(publishedSurvey as never);
    vi.mocked(prisma.surveyResponse.create).mockResolvedValue({
      id: draftResponse.id,
      surveyId: publishedSurvey.id,
      status: 'draft',
    } as never);

    const start = await request(app)
      .post(`/api/surveys/${publishedSurvey.id}/response-session`)
      .send({});

    expect(start.status).toBe(201);
    expect(start.body.responseId).toBe(draftResponse.id);
    expect(start.body.status).toBe('draft');
    expect(typeof start.body.sessionToken).toBe('string');

    vi.mocked(prisma.surveyResponse.findUnique).mockResolvedValue(draftResponse as never);
    vi.mocked(prisma.questionRecording.create).mockImplementation(async ({ data }: QuestionRecordingCreateArgs) => ({
      id: 'recording-1',
      ...data,
      createdAt: new Date().toISOString(),
    }) as never);

    const upload = await request(app)
      .post('/api/surveys/recordings/upload')
      .field('responseId', start.body.responseId)
      .field('sessionToken', start.body.sessionToken)
      .attach('recording', Buffer.from('data'), 'clip.webm');

    expect(upload.status).toBe(201);
    expect(vi.mocked(prisma.questionRecording.create)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          responseId: draftResponse.id,
        }),
      })
    );
  });

  it('updates the existing draft response on final submit', async () => {
    const sessionToken = jwt.sign(
      {
        responseId: draftResponse.id,
        surveyId: publishedSurvey.id,
        scope: 'response-session',
      },
      process.env.JWT_SECRET as string
    );

    vi.mocked(prisma.survey.findUnique).mockResolvedValue(publishedSurvey as never);
    vi.mocked(prisma.surveyResponse.findUnique).mockResolvedValue({
      id: draftResponse.id,
      surveyId: publishedSurvey.id,
      status: 'draft',
      participantId: null,
    } as never);
    vi.mocked(prisma.surveyResponse.update).mockResolvedValue({
      id: draftResponse.id,
      surveyId: publishedSurvey.id,
      status: 'submitted',
      answers: [{ questionId: 'q1', value: 'hello' }],
      metadata: { source: 'test' },
    } as never);

    const submit = await request(app)
      .post('/api/surveys/respond')
      .send({
        surveyId: publishedSurvey.id,
        responseId: draftResponse.id,
        sessionToken,
        answers: [{ questionId: 'q1', value: 'hello' }],
        metadata: { source: 'test' },
      });

    expect(submit.status).toBe(201);
    expect(vi.mocked(prisma.surveyResponse.create)).not.toHaveBeenCalled();
    expect(vi.mocked(prisma.surveyResponse.update)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: draftResponse.id },
        data: expect.objectContaining({
          status: 'submitted',
        }),
      })
    );
  });
});
