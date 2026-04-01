import type { Request, Response } from 'express';
import { Prisma, type QuestionRecording } from '@prisma/client';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { prisma } from '../prisma.js';
import { buildRecordingStoragePath, getRecordingAbsolutePath } from '../uploads.js';
import { surveyCreateSchema, surveyUpdateSchema } from '../validators/survey.js';

interface SurveyAccessContext {
  userId?: string | null;
  teamId?: string | null;
}

interface SurveyAssociationInput {
  teamId?: string | null;
  folderId?: string | null;
}

interface ResponseSessionTokenPayload extends jwt.JwtPayload {
  responseId: string;
  scope: string;
  surveyId: string;
}

const RESPONSE_SESSION_SCOPE = 'response-session';

const logControllerError = (scope: string, error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[${scope}] ${message}`);
};

const hasSurveyAccess = async (
  survey: SurveyAccessContext,
  userId?: string,
  roles?: string[]
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
      ...(roles ? { role: { in: roles } } : {}),
    },
  });

  return Boolean(membership);
};

const createResponseSessionToken = (responseId: string, surveyId: string) => (
  jwt.sign(
    {
      responseId,
      scope: RESPONSE_SESSION_SCOPE,
      surveyId,
    },
    config.jwtSecret,
    { expiresIn: '2h' }
  )
);

const hasValidResponseSessionToken = (
  token: string | undefined,
  responseId: string,
  surveyId: string
) => {
  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as ResponseSessionTokenPayload;

    return decoded.scope === RESPONSE_SESSION_SCOPE
      && decoded.responseId === responseId
      && decoded.surveyId === surveyId;
  } catch {
    return false;
  }
};

const mapRecordingForClient = (recording: QuestionRecording) => ({
  ...recording,
  recordingUrl: `/api/surveys/recordings/${recording.id}/file`,
});

const deleteRecordingFileIfExists = (storagePath: string) => {
  const filePath = getRecordingAbsolutePath(storagePath);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const resolveSurveyAssociations = async (
  userId: string,
  { teamId, folderId }: SurveyAssociationInput,
) => {
  let resolvedTeamId = teamId ?? null;
  const resolvedFolderId = folderId ?? null;

  if (resolvedTeamId) {
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: resolvedTeamId,
        userId,
      },
    });

    if (!membership) {
      return { ok: false as const, status: 403, message: 'Forbidden: You do not belong to this team' };
    }
  }

  if (!resolvedFolderId) {
    return {
      ok: true as const,
      teamId: resolvedTeamId,
      folderId: resolvedFolderId,
    };
  }

  const folder = await prisma.folder.findUnique({
    where: { id: resolvedFolderId },
  });

  if (!folder) {
    return { ok: false as const, status: 400, message: 'Folder not found' };
  }

  if (folder.userId) {
    if (folder.userId !== userId) {
      return { ok: false as const, status: 403, message: 'Forbidden: You do not own this folder' };
    }

    if (resolvedTeamId) {
      return { ok: false as const, status: 400, message: 'A personal folder cannot be combined with a team association' };
    }
  }

  if (folder.teamId) {
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: folder.teamId,
        userId,
      },
    });

    if (!membership) {
      return { ok: false as const, status: 403, message: 'Forbidden: You do not have access to this team folder' };
    }

    if (resolvedTeamId && resolvedTeamId !== folder.teamId) {
      return { ok: false as const, status: 400, message: 'Folder does not belong to the selected team' };
    }

    resolvedTeamId = folder.teamId;
  }

  return {
    ok: true as const,
    teamId: resolvedTeamId,
    folderId: resolvedFolderId,
  };
};

// Survey CRUD
export const getSurveys = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const surveys = await prisma.survey.findMany({
      where: {
        OR: [
          { userId },
          {
            team: {
              members: {
                some: { userId },
              },
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(surveys);
  } catch (error) {
    logControllerError('survey.getSurveys', error);
    res.status(500).json({ message: 'Error fetching surveys' });
  }
};

export const getSurveyById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const survey = await prisma.survey.findUnique({
      where: { id: id as string },
      include: {
        folder: true,
        team: true,
      },
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (userId) {
      const canAccessSurvey = await hasSurveyAccess(survey, userId);

      if (!canAccessSurvey) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to this survey' });
      }
    } else if (!survey.isPublished) {
      return res.status(403).json({ message: 'Forbidden: This survey is not published' });
    }

    res.json(survey);
  } catch (error) {
    logControllerError('survey.getSurveyById', error);
    res.status(500).json({ message: 'Error fetching survey' });
  }
};

export const getSurveyByPublicCode = async (req: Request, res: Response) => {
  const { publicCode } = req.params;

  try {
    const survey = await prisma.survey.findUnique({
      where: { publicCode: publicCode as string },
    });

    if (!survey || !survey.isPublished) {
      return res.status(404).json({ message: 'Survey not found or not published' });
    }

    res.json(survey);
  } catch (error) {
    logControllerError('survey.getSurveyByPublicCode', error);
    res.status(500).json({ message: 'Error fetching survey by public code' });
  }
};

export const createSurvey = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const parsed = surveyCreateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid survey payload' });
    }

    const { name, description, questions, folderId, teamId, ...rest } = parsed.data;
    const associations = await resolveSurveyAssociations(userId, { folderId, teamId });

    if (!associations.ok) {
      return res.status(associations.status).json({ message: associations.message });
    }

    const createData: Prisma.SurveyUncheckedCreateInput = {
      name,
      description,
      questions: (questions || []) as Prisma.InputJsonValue,
      folderId: associations.folderId,
      teamId: associations.teamId,
      userId,
      ...rest,
    };

    const survey = await prisma.survey.create({
      data: createData,
    });

    res.status(201).json(survey);
  } catch (error) {
    logControllerError('survey.createSurvey', error);
    res.status(500).json({ message: 'Error creating survey' });
  }
};

export const updateSurvey = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const survey = await prisma.survey.findUnique({ where: { id: id as string } });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const canUpdateSurvey = await hasSurveyAccess(survey, userId, ['owner', 'admin']);

    if (!canUpdateSurvey) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const parsed = surveyUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid survey payload' });
    }

    const nextTeamId = Object.prototype.hasOwnProperty.call(parsed.data, 'teamId')
      ? parsed.data.teamId ?? null
      : survey.teamId ?? null;
    const nextFolderId = Object.prototype.hasOwnProperty.call(parsed.data, 'folderId')
      ? parsed.data.folderId ?? null
      : survey.folderId ?? null;

    const associations = await resolveSurveyAssociations(userId as string, {
      teamId: nextTeamId,
      folderId: nextFolderId,
    });

    if (!associations.ok) {
      return res.status(associations.status).json({ message: associations.message });
    }

    const { questions, ...restUpdates } = parsed.data;
    const updates: Prisma.SurveyUncheckedUpdateInput = {
      ...restUpdates,
      ...(Object.prototype.hasOwnProperty.call(parsed.data, 'questions')
        ? { questions: (questions || []) as Prisma.InputJsonValue }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(parsed.data, 'teamId') || associations.teamId !== (survey.teamId ?? null)
        ? { teamId: associations.teamId }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(parsed.data, 'folderId')
        ? { folderId: associations.folderId }
        : {}),
    };

    const updated = await prisma.survey.update({
      where: { id: id as string },
      data: updates,
    });

    res.json(updated);
  } catch (error) {
    logControllerError('survey.updateSurvey', error);
    res.status(500).json({ message: 'Error updating survey' });
  }
};

export const deleteSurvey = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const survey = await prisma.survey.findUnique({ where: { id: id as string } });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const canDeleteSurvey = await hasSurveyAccess(survey, userId, ['owner', 'admin']);

    if (!canDeleteSurvey) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.survey.delete({ where: { id: id as string } });
    res.json({ message: 'Survey deleted' });
  } catch (error) {
    logControllerError('survey.deleteSurvey', error);
    res.status(500).json({ message: 'Error deleting survey' });
  }
};

export const startResponseSession = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  const participantId = req.user?.id;
  const { metadata, participantEmail } = req.body ?? {};

  try {
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId as string },
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (!survey.isPublished) {
      return res.status(403).json({ message: 'Survey is not published' });
    }

    const response = await prisma.surveyResponse.create({
      data: {
        surveyId: surveyId as string,
        participantId,
        participantEmail,
        metadata: metadata || {},
        status: 'draft',
      },
    });
    const responseSessionToken = createResponseSessionToken(response.id, surveyId as string);

    res.status(201).json({
      responseId: response.id,
      responseToken: responseSessionToken,
      sessionToken: responseSessionToken,
      status: response.status,
    });
  } catch (error) {
    logControllerError('survey.startResponseSession', error);
    res.status(500).json({ message: 'Error starting response session' });
  }
};

// Response Submission
export const submitResponse = async (req: Request, res: Response) => {
  const { surveyId, responseId, responseToken, sessionToken, answers, metadata, participantEmail } = req.body;
  const participantId = req.user?.id;
  const effectiveResponseToken = sessionToken || responseToken;

  try {
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (!survey.isPublished) {
      return res.status(403).json({ message: 'Survey is not published' });
    }

    if (responseId) {
      const existingResponse = await prisma.surveyResponse.findUnique({
        where: { id: responseId as string },
      });

      if (!existingResponse) {
        return res.status(404).json({ message: 'Response not found' });
      }

      if (existingResponse.surveyId !== surveyId) {
        return res.status(400).json({ message: 'Response does not belong to this survey' });
      }

      const hasTokenAccess = hasValidResponseSessionToken(
        effectiveResponseToken,
        responseId as string,
        surveyId as string
      );
      const hasParticipantAccess = Boolean(participantId && existingResponse.participantId === participantId);
      const hasManagerAccess = await hasSurveyAccess(survey, participantId, ['owner', 'admin']);

      if (!hasTokenAccess && !hasParticipantAccess && !hasManagerAccess) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (existingResponse.status === 'submitted') {
        return res.status(400).json({ message: 'Response has already been submitted' });
      }

      const updatedResponse = await prisma.surveyResponse.update({
        where: { id: responseId as string },
        data: {
          answers: answers || [],
          metadata: metadata || {},
          participantEmail,
          participantId: existingResponse.participantId ?? participantId,
          status: 'submitted',
          submittedAt: new Date(),
        },
      });

      return res.status(201).json(updatedResponse);
    }

    const response = await prisma.surveyResponse.create({
      data: {
        surveyId,
        answers: answers || [],
        metadata: metadata || {},
        participantId,
        participantEmail,
        status: 'submitted',
      },
    });

    res.status(201).json(response);
  } catch (error) {
    logControllerError('survey.submitResponse', error);
    res.status(500).json({ message: 'Error submitting response' });
  }
};

// Analysis / Responses
export const getSurveyResponses = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  const userId = req.user?.id;

  try {
    const survey = await prisma.survey.findUnique({ where: { id: surveyId as string } });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const canAccessSurvey = await hasSurveyAccess(survey, userId);

    if (!canAccessSurvey) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const responses = await prisma.surveyResponse.findMany({
      where: {
        surveyId: surveyId as string,
        deletedAt: null,
        status: 'submitted',
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.json(responses);
  } catch (error) {
    logControllerError('survey.getSurveyResponses', error);
    res.status(500).json({ message: 'Error fetching responses' });
  }
};

export const deleteResponses = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  const { participantId, participantEmail, softDelete } = req.body;
  const userId = req.user?.id;

  try {
    const survey = await prisma.survey.findUnique({ where: { id: surveyId as string } });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const canManageResponses = await hasSurveyAccess(survey, userId, ['owner', 'admin']);

    if (!canManageResponses) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const where: Record<string, unknown> = {
      surveyId: surveyId as string,
      status: 'submitted',
    };

    if (participantId) {
      where.participantId = participantId;
    }

    if (participantEmail) {
      where.participantEmail = participantEmail;
    }

    if (softDelete) {
      const result = await prisma.surveyResponse.updateMany({
        where,
        data: { deletedAt: new Date() },
      });

      return res.json({ count: result.count });
    }

    const result = await prisma.surveyResponse.deleteMany({ where });
    res.json({ count: result.count });
  } catch (error) {
    logControllerError('survey.deleteResponses', error);
    res.status(500).json({ message: 'Error deleting responses' });
  }
};

// Folders
export const getFolders = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const folders = await prisma.folder.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });

    res.json(folders);
  } catch (error) {
    logControllerError('survey.getFolders', error);
    res.status(500).json({ message: 'Error fetching folders' });
  }
};

export const createFolder = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { name, order } = req.body;

  try {
    const folder = await prisma.folder.create({
      data: {
        name,
        order: order || 0,
        userId,
      },
    });

    res.status(201).json(folder);
  } catch (error) {
    logControllerError('survey.createFolder', error);
    res.status(500).json({ message: 'Error creating folder' });
  }
};

export const updateFolder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, order } = req.body;
  const userId = req.user?.id;

  try {
    const folder = await prisma.folder.findUnique({ where: { id: id as string } });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    if (folder.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.folder.update({
      where: { id: id as string },
      data: { name, order },
    });

    res.json(updated);
  } catch (error) {
    logControllerError('survey.updateFolder', error);
    res.status(500).json({ message: 'Error updating folder' });
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const folder = await prisma.folder.findUnique({ where: { id: id as string } });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    if (folder.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.folder.delete({ where: { id: id as string } });
    res.json({ message: 'Folder deleted' });
  } catch (error) {
    logControllerError('survey.deleteFolder', error);
    res.status(500).json({ message: 'Error deleting folder' });
  }
};

// Recordings
export const getSurveyRecordings = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  const userId = req.user?.id;

  try {
    const survey = await prisma.survey.findUnique({ where: { id: surveyId as string } });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const canAccessSurvey = await hasSurveyAccess(survey, userId);

    if (!canAccessSurvey) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const recordings = await prisma.questionRecording.findMany({
      where: {
        response: {
          surveyId: surveyId as string,
          status: 'submitted',
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(recordings.map(mapRecordingForClient));
  } catch (error) {
    logControllerError('survey.getSurveyRecordings', error);
    res.status(500).json({ message: 'Error fetching recordings' });
  }
};

export const getRecordingFile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const recording = await prisma.questionRecording.findUnique({
      where: { id: id as string },
      include: { response: { include: { survey: true } } },
    });

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    const canAccessRecording = await hasSurveyAccess(recording.response.survey, userId);

    if (!canAccessRecording) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const filePath = getRecordingAbsolutePath(recording.recordingUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Recording file not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    logControllerError('survey.getRecordingFile', error);
    res.status(500).json({ message: 'Error fetching recording file' });
  }
};

export const deleteRecording = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const recording = await prisma.questionRecording.findUnique({
      where: { id: id as string },
      include: { response: { include: { survey: true } } },
    });

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    const canDeleteRecording = await hasSurveyAccess(recording.response.survey, userId, ['owner', 'admin']);

    if (!canDeleteRecording) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    deleteRecordingFileIfExists(recording.recordingUrl);
    await prisma.questionRecording.delete({ where: { id: id as string } });

    res.json({ message: 'Recording deleted' });
  } catch (error) {
    logControllerError('survey.deleteRecording', error);
    res.status(500).json({ message: 'Error deleting recording' });
  }
};

export const uploadRecording = async (req: Request, res: Response) => {
  const {
    responseId,
    responseToken,
    sessionToken,
    questionId,
    recordingType,
    fileFormat,
    durationSeconds,
  } = req.body;
  const userId = req.user?.id;
  const file = req.file;
  const effectiveResponseToken = sessionToken || responseToken;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  if (!responseId) {
    deleteRecordingFileIfExists(buildRecordingStoragePath(file.filename));
    return res.status(400).json({ message: 'Response ID is required' });
  }

  try {
    const responseData = await prisma.surveyResponse.findUnique({
      where: { id: responseId as string },
      include: { survey: true },
    });

    if (!responseData) {
      deleteRecordingFileIfExists(buildRecordingStoragePath(file.filename));
      return res.status(404).json({ message: 'Response not found' });
    }

    if (responseData.status !== 'draft') {
      deleteRecordingFileIfExists(buildRecordingStoragePath(file.filename));
      return res.status(400).json({ message: 'Response session is no longer accepting uploads' });
    }

    const hasTokenAccess = hasValidResponseSessionToken(
      effectiveResponseToken,
      responseId as string,
      responseData.surveyId
    );
    const hasParticipantAccess = Boolean(userId && responseData.participantId === userId);
    const hasManagerAccess = await hasSurveyAccess(responseData.survey, userId);

    if (!hasTokenAccess && !hasParticipantAccess && !hasManagerAccess) {
      deleteRecordingFileIfExists(buildRecordingStoragePath(file.filename));
      return res.status(403).json({ message: 'Forbidden' });
    }

    const recording = await prisma.questionRecording.create({
      data: {
        responseId,
        questionId: questionId || '',
        recordingUrl: buildRecordingStoragePath(file.filename),
        recordingType: recordingType || 'screen-webcam',
        fileFormat: fileFormat || 'webm',
        durationSeconds: Number.parseInt(durationSeconds, 10) || null,
        fileSizeBytes: file.size,
      },
    });

    res.status(201).json(mapRecordingForClient(recording));
  } catch (error) {
    deleteRecordingFileIfExists(buildRecordingStoragePath(file.filename));
    logControllerError('survey.uploadRecording', error);
    res.status(500).json({ message: 'Error saving recording metadata' });
  }
};
