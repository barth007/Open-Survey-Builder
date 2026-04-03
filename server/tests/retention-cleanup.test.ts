import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup.js';

vi.mock('../src/prisma.js', () => ({
  prisma: {
    survey: {
      findMany: vi.fn(),
    },
    surveyResponse: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    responseDeletion: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from '../src/prisma.js';
import { runRetentionCleanup } from '../src/jobs/retention-cleanup.js';

describe('retention cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('moves expired responses to trash and schedules purge using the survey retention policy', async () => {
    vi.mocked(prisma.survey.findMany).mockResolvedValue([
      {
        id: 'survey-1',
        retention: {
          enabled: true,
          value: 30,
          unit: 'days',
          trashGracePeriodDays: 7,
        },
      },
    ] as never);
    vi.mocked(prisma.surveyResponse.findMany)
      .mockResolvedValueOnce([
        {
          id: 'response-1',
          surveyId: 'survey-1',
          participantId: 'participant-1',
          participantEmail: 'alice@example.com',
          answers: [],
          metadata: {},
        },
      ] as never)
      .mockResolvedValueOnce([] as never);
    vi.mocked(prisma.surveyResponse.updateMany).mockResolvedValue({ count: 1 } as never);

    await runRetentionCleanup(new Date('2026-04-01T12:00:00.000Z'));

    expect(vi.mocked(prisma.surveyResponse.updateMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: {
            in: ['response-1'],
          },
        },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
          purgeAfter: new Date('2026-04-08T12:00:00.000Z'),
        }),
      }),
    );
    expect(vi.mocked(prisma.responseDeletion.create)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          surveyId: 'survey-1',
          responsesCount: 1,
        }),
      }),
    );
  });

  it('permanently purges responses whose trash grace window already elapsed', async () => {
    vi.mocked(prisma.survey.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.surveyResponse.findMany).mockResolvedValueOnce([
      {
        id: 'response-9',
      },
    ] as never);
    vi.mocked(prisma.surveyResponse.deleteMany).mockResolvedValue({ count: 1 } as never);

    await runRetentionCleanup(new Date('2026-04-01T12:00:00.000Z'));

    expect(vi.mocked(prisma.surveyResponse.deleteMany)).toHaveBeenCalledWith({
      where: {
        id: {
          in: ['response-9'],
        },
      },
    });
  });
});
