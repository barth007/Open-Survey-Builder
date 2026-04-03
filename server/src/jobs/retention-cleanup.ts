import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.js';

type JsonRecord = Record<string, unknown>;

interface SurveyRetentionSettings {
  enabled?: boolean;
  value?: number;
  unit?: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  trashGracePeriodDays?: number;
}

const isJsonRecord = (value: unknown): value is JsonRecord => (
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value)
);

const getRetentionSettings = (survey: { retention?: unknown }): SurveyRetentionSettings | undefined => (
  isJsonRecord(survey.retention)
    ? survey.retention as SurveyRetentionSettings
    : undefined
);

const subtractRetentionWindow = (baseDate: Date, retention: SurveyRetentionSettings) => {
  const nextDate = new Date(baseDate);
  const value = retention.value || 0;

  switch (retention.unit) {
    case 'minutes':
      nextDate.setMinutes(nextDate.getMinutes() - value);
      break;
    case 'hours':
      nextDate.setHours(nextDate.getHours() - value);
      break;
    case 'weeks':
      nextDate.setDate(nextDate.getDate() - (value * 7));
      break;
    case 'months':
      nextDate.setMonth(nextDate.getMonth() - value);
      break;
    case 'years':
      nextDate.setFullYear(nextDate.getFullYear() - value);
      break;
    case 'days':
    default:
      nextDate.setDate(nextDate.getDate() - value);
      break;
  }

  return nextDate;
};

const addGraceWindow = (baseDate: Date, days: number) => {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

export const runRetentionCleanup = async (now = new Date()) => {
  const surveys = await prisma.survey.findMany({
    where: {
      retention: {
        not: Prisma.JsonNull,
      },
    },
    select: {
      id: true,
      retention: true,
    },
  });

  for (const survey of surveys) {
    const retention = getRetentionSettings(survey);

    if (!retention?.enabled || !retention.value || !retention.unit) {
      continue;
    }

    const cutoffDate = subtractRetentionWindow(now, retention);
    const trashGracePeriodDays = retention.trashGracePeriodDays ?? 30;
    const expiredResponses = await prisma.surveyResponse.findMany({
      where: {
        surveyId: survey.id,
        deletedAt: null,
        submittedAt: {
          lte: cutoffDate,
        },
      },
      select: {
        id: true,
        surveyId: true,
        participantId: true,
        participantEmail: true,
        answers: true,
        metadata: true,
      },
    });

    if (expiredResponses.length > 0) {
      const responseIds = expiredResponses.map((response) => response.id);

      await prisma.surveyResponse.updateMany({
        where: {
          id: {
            in: responseIds,
          },
        },
        data: {
          deletedAt: now,
          purgeAfter: addGraceWindow(now, trashGracePeriodDays),
        },
      });

      await prisma.responseDeletion.create({
        data: {
          surveyId: survey.id,
          responsesCount: expiredResponses.length,
          deletionReason: 'retention_cleanup',
          responsesBackup: expiredResponses,
        },
      });
    }
  }

  const purgeCandidates = await prisma.surveyResponse.findMany({
    where: {
      deletedAt: {
        not: null,
      },
      purgeAfter: {
        lte: now,
      },
    },
    select: {
      id: true,
    },
  });

  if (purgeCandidates.length > 0) {
    await prisma.surveyResponse.deleteMany({
      where: {
        id: {
          in: purgeCandidates.map((response) => response.id),
        },
      },
    });
  }
};
