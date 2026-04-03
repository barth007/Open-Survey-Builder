import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.js';
import {
  getValidationMessage,
  surveyInsightEventSchema,
} from '../validators/survey-insights.js';

interface SurveyAccessContext {
  userId?: string | null;
  teamId?: string | null;
}

const hasSurveyAccess = async (
  survey: SurveyAccessContext,
  userId?: string,
) => {
  if (!userId) {
    return false;
  }

  if (survey.userId === userId) {
    return true;
  }

  if (!survey.teamId) {
    return false;
  }

  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId: survey.teamId,
      userId,
    },
  });

  return Boolean(membership);
};

const logInsightsError = (scope: string, error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[${scope}] ${message}`);
};

export const trackSurveyInsightEvent = async (req: Request, res: Response) => {
  const { publicCode } = req.params;
  const parsed = surveyInsightEventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: getValidationMessage(parsed.error.issues) });
  }

  const { sessionId, eventType, questionId, pageIndex, metadata } = parsed.data;

  try {
    const survey = await prisma.survey.findUnique({
      where: { publicCode: publicCode as string },
    });

    if (!survey || !survey.isPublished) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    await prisma.surveyInsightEvent.create({
      data: {
        surveyId: survey.id,
        sessionId,
        eventType,
        questionId: typeof questionId === 'string' ? questionId : null,
        pageIndex: typeof pageIndex === 'number' ? pageIndex : null,
        metadata: (typeof metadata === 'object' && metadata !== null ? metadata : {}) as Prisma.InputJsonValue,
      },
    });

    res.status(204).send();
  } catch (error) {
    logInsightsError('surveyInsights.track', error);
    res.status(500).json({ message: 'Error tracking survey insight event' });
  }
};

export const getSurveyInsights = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  const userId = req.user?.id;

  try {
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId as string },
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (!await hasSurveyAccess(survey, userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [events, submissions] = await Promise.all([
      prisma.surveyInsightEvent.findMany({
        where: { surveyId: surveyId as string },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.surveyResponse.count({
        where: {
          surveyId: surveyId as string,
          deletedAt: null,
          status: 'submitted',
        },
      }),
    ]);

    const questionOrder = new Map(
      (Array.isArray(survey.questions) ? survey.questions : []).flatMap((question, index) => {
        const record = question as { id?: string; text?: string };

        if (typeof record.id !== 'string' || record.id.length === 0) {
          return [];
        }

        return [[record.id, { index, label: record.text || record.id || 'Question' }] as const];
      }),
    );

    const viewSessions = new Set<string>();
    const startSessions = new Set<string>();
    const explicitSubmitSessions = new Set<string>();
    const questionReach = new Map<string, Set<string>>();
    const sessionProgress = new Map<string, { questionId: string; questionOrder: number; createdAt: Date }>();

    for (const event of events) {
      if (event.eventType === 'form_view') {
        viewSessions.add(event.sessionId);
      }

      if (event.eventType === 'form_start') {
        startSessions.add(event.sessionId);
      }

      if (event.eventType === 'form_submit') {
        explicitSubmitSessions.add(event.sessionId);
      }

      if (event.eventType === 'question_reached' && event.questionId) {
        if (!questionReach.has(event.questionId)) {
          questionReach.set(event.questionId, new Set());
        }

        questionReach.get(event.questionId)?.add(event.sessionId);

        const order = questionOrder.get(event.questionId)?.index ?? -1;
        const currentProgress = sessionProgress.get(event.sessionId);

        if (
          !currentProgress ||
          order > currentProgress.questionOrder ||
          (order === currentProgress.questionOrder && event.createdAt > currentProgress.createdAt)
        ) {
          sessionProgress.set(event.sessionId, {
            questionId: event.questionId,
            questionOrder: order,
            createdAt: event.createdAt,
          });
        }
      }
    }

    const inferredCompletedSessions = [...sessionProgress.entries()]
      .filter(([sessionId]) => startSessions.has(sessionId) && !explicitSubmitSessions.has(sessionId))
      .sort((left, right) => {
        if (right[1].questionOrder !== left[1].questionOrder) {
          return right[1].questionOrder - left[1].questionOrder;
        }

        return right[1].createdAt.getTime() - left[1].createdAt.getTime();
      })
      .slice(0, Math.max(submissions - explicitSubmitSessions.size, 0))
      .map(([sessionId]) => sessionId);

    const completedSessions = new Set([
      ...explicitSubmitSessions,
      ...inferredCompletedSessions,
    ]);

    const questionDropOff = [...questionOrder.entries()].map(([questionId, meta]) => {
      const reachedCount = questionReach.get(questionId)?.size ?? 0;
      let dropOffCount = 0;

      for (const [sessionId, progress] of sessionProgress.entries()) {
        if (!startSessions.has(sessionId) || completedSessions.has(sessionId)) {
          continue;
        }

        if (progress.questionId === questionId) {
          dropOffCount += 1;
        }
      }

      return {
        questionId,
        questionLabel: meta.label,
        reachedCount,
        dropOffCount,
      };
    });

    const views = viewSessions.size;
    const starts = startSessions.size;

    res.json({
      overview: {
        views,
        starts,
        submissions,
        conversionRate: views > 0 ? Math.round((submissions / views) * 1000) / 10 : 0,
      },
      questionDropOff,
    });
  } catch (error) {
    logInsightsError('surveyInsights.get', error);
    res.status(500).json({ message: 'Error loading survey insights' });
  }
};
