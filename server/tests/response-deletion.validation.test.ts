import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

vi.mock('../src/prisma.js', () => ({
  prisma: {
    survey: {
      findUnique: vi.fn(),
    },
    surveyResponse: {
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    teamMember: {
      findFirst: vi.fn(),
    },
  },
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

const bearer = `Bearer ${jwt.sign({ userId: 'owner-1' }, process.env.JWT_SECRET as string)}`;

describe('response deletion validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects response deletion without a participant filter', async () => {
    const res = await request(app)
      .delete('/api/surveys/survey-1/responses')
      .set('Authorization', bearer)
      .send({});

    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.survey.findUnique)).not.toHaveBeenCalled();
    expect(vi.mocked(prisma.surveyResponse.deleteMany)).not.toHaveBeenCalled();
    expect(vi.mocked(prisma.surveyResponse.updateMany)).not.toHaveBeenCalled();
  });

  it('rejects response deletion with an invalid participant email', async () => {
    const res = await request(app)
      .delete('/api/surveys/survey-1/responses')
      .set('Authorization', bearer)
      .send({
        participantEmail: 'not-an-email',
      });

    expect(res.status).toBe(400);
    expect(vi.mocked(prisma.survey.findUnique)).not.toHaveBeenCalled();
    expect(vi.mocked(prisma.surveyResponse.deleteMany)).not.toHaveBeenCalled();
    expect(vi.mocked(prisma.surveyResponse.updateMany)).not.toHaveBeenCalled();
  });
});
