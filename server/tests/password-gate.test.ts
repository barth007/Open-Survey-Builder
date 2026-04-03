import { hashSync } from 'bcryptjs';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

const protectedSurvey = {
  id: 'survey-1',
  publicCode: 'public-1',
  isPublished: true,
  userId: 'owner-1',
  teamId: null,
  name: 'Protected survey',
  description: 'Only invited respondents should see this.',
  questions: [
    {
      id: 'q-name',
      type: 'text',
      text: 'What is your name?',
      isRequired: false,
      options: [],
    },
  ],
  settings: {
    access: {
      passwordProtection: {
        enabled: true,
        passwordHash: hashSync('secret123', 10),
      },
    },
  },
  appearance: {
    colors: {
      background: '#fffdf8',
    },
  },
};

vi.mock('../src/prisma.js', () => ({
  prisma: {
    survey: {
      findUnique: vi.fn(),
    },
    surveyResponse: {
      create: vi.fn(),
    },
    teamMember: {
      findFirst: vi.fn(),
    },
  },
}));

import { app } from '../src/app.js';
import { prisma } from '../src/prisma.js';

describe('password-protected public forms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.survey.findUnique).mockResolvedValue(protectedSurvey as never);
  });

  it('returns a locked shell when the form is protected and no access token is provided', async () => {
    const res = await request(app).get('/api/surveys/public/public-1');

    expect(res.status).toBe(200);
    expect(res.body.publicAccessState).toEqual({
      passwordRequired: true,
    });
    expect(res.body.questions).toEqual([]);
    expect(res.body.settings.access.passwordProtection.passwordHash).toBeUndefined();
    expect(res.body.settings.access.passwordProtection.hasPassword).toBe(true);
  });

  it('issues an access token for the correct password and then serves the full survey', async () => {
    const unlock = await request(app)
      .post('/api/surveys/public/public-1/access')
      .send({
        password: 'secret123',
      });

    expect(unlock.status).toBe(200);
    expect(typeof unlock.body.accessToken).toBe('string');

    const surveyRes = await request(app)
      .get('/api/surveys/public/public-1')
      .set('x-form-access-token', unlock.body.accessToken);

    expect(surveyRes.status).toBe(200);
    expect(surveyRes.body.publicAccessState?.passwordRequired).not.toBe(true);
    expect(surveyRes.body.questions).toHaveLength(1);
  });

  it('rejects response sessions until the form is unlocked', async () => {
    const res = await request(app)
      .post('/api/surveys/survey-1/response-session')
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Password required');
  });
});
