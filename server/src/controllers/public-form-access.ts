import type { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import {
  createPublicFormAccessToken,
  isSurveyPasswordProtected,
  verifyPublicFormPassword,
} from '../lib/public-form-access.js';

const logControllerError = (scope: string, error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[${scope}] ${message}`);
};

export const unlockPublicForm = async (req: Request, res: Response) => {
  const { publicCode } = req.params;
  const password = typeof req.body?.password === 'string'
    ? req.body.password
    : '';

  try {
    const survey = await prisma.survey.findUnique({
      where: { publicCode: publicCode as string },
    });

    if (!survey || !survey.isPublished) {
      return res.status(404).json({ message: 'Survey not found or not published' });
    }

    if (!isSurveyPasswordProtected(survey)) {
      return res.status(400).json({ message: 'Password protection is not enabled' });
    }

    const isValidPassword = await verifyPublicFormPassword(survey, password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    return res.json({
      accessToken: createPublicFormAccessToken(survey.id, survey.publicCode || publicCode as string),
    });
  } catch (error) {
    logControllerError('publicFormAccess.unlockPublicForm', error);
    return res.status(500).json({ message: 'Error unlocking form' });
  }
};
