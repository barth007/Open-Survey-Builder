import cors from 'cors';
import express from 'express';
import multer from 'multer';
import {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  exportAccountData,
  deleteAccount,
  getPendingProfiles,
  updateProfileStatus,
  requestPasswordReset,
  resetPasswordWithToken,
} from './controllers/auth.js';
import {
  trackSurveyInsightEvent,
  getSurveyInsights,
} from './controllers/survey-insights.js';
import {
  listSurveyRevisions,
  restoreSurveyRevision,
} from './controllers/survey-revisions.js';
import {
  getSurveys,
  getSurveyById,
  getSurveyByPublicCode,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  submitResponse,
  getSurveyResponses,
  deleteResponses,
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  getSurveyRecordings,
  deleteRecording,
  getRecordingFile,
  getResponseSession,
  startResponseSession,
  uploadRecording,
} from './controllers/survey.js';
import { unlockPublicForm } from './controllers/public-form-access.js';
import {
  avatarUpload,
  avatarUploadsDir,
  buildAvatarUrl,
  recordingUpload,
} from './uploads.js';
import {
  createTeam,
  getTeams,
  getTeamMembers,
  updateTeamMemberRole,
  removeTeamMember,
  updateTeam,
  deleteTeam,
  sendInvitation,
  getTeamInvitations,
  getUserInvitations,
  acceptInvitation,
  rejectInvitation,
} from './controllers/team.js';
import { auth, optionalAuth } from './middleware/auth.js';
import { createRateLimitMiddleware } from './middleware/rate-limit.js';
import { config } from './config.js';

export const app = express();
app.disable('x-powered-by');

const authRateLimit = createRateLimitMiddleware({
  keyPrefix: 'auth',
  maxRequests: 10,
  windowMs: 15 * 60 * 1000,
});

const publicWriteRateLimit = createRateLimitMiddleware({
  keyPrefix: 'public-write',
  maxRequests: 30,
  windowMs: 5 * 60 * 1000,
});

const avatarUploadRateLimit = createRateLimitMiddleware({
  keyPrefix: 'avatar-upload',
  maxRequests: 10,
  windowMs: 5 * 60 * 1000,
});

const invitationRateLimit = createRateLimitMiddleware({
  keyPrefix: 'team-invitation',
  maxRequests: 10,
  windowMs: 15 * 60 * 1000,
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use((_, res, next) => {
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
app.use(express.json({ limit: '10mb' }));

app.use('/uploads/avatars', express.static(avatarUploadsDir, {
  fallthrough: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/system/capabilities', (_req, res) => {
  res.json(config.capabilities);
});

app.post('/api/auth/register', authRateLimit, register);
app.post('/api/auth/login', authRateLimit, login);
app.post('/api/auth/request-reset', authRateLimit, requestPasswordReset);
app.post('/api/auth/reset-password', authRateLimit, resetPasswordWithToken);

app.get('/api/auth/admin/pending', auth, getPendingProfiles);
app.put('/api/auth/admin/profiles/:id', auth, updateProfileStatus);

app.get('/api/surveys/folders', auth, getFolders);
app.post('/api/surveys/folders', auth, createFolder);
app.put('/api/surveys/folders/:id', auth, updateFolder);
app.delete('/api/surveys/folders/:id', auth, deleteFolder);

app.post('/api/surveys/respond', publicWriteRateLimit, optionalAuth, submitResponse);
app.get('/api/surveys/respond/session/:responseId', optionalAuth, getResponseSession);
app.post('/api/surveys/:surveyId/response-session', publicWriteRateLimit, optionalAuth, startResponseSession);

app.post('/api/surveys/recordings/upload', publicWriteRateLimit, optionalAuth, recordingUpload.single('recording'), uploadRecording);
app.delete('/api/surveys/recordings/:id', auth, deleteRecording);
app.get('/api/surveys/recordings/:id/file', auth, getRecordingFile);

app.get('/api/surveys', auth, getSurveys);
app.post('/api/surveys/public/:publicCode/access', publicWriteRateLimit, unlockPublicForm);
app.post('/api/surveys/public/:publicCode/insights', publicWriteRateLimit, trackSurveyInsightEvent);
app.get('/api/surveys/public/:publicCode', getSurveyByPublicCode);
app.post('/api/surveys', auth, createSurvey);

app.get('/api/surveys/:id', optionalAuth, getSurveyById);
app.put('/api/surveys/:id', auth, updateSurvey);
app.delete('/api/surveys/:id', auth, deleteSurvey);
app.get('/api/surveys/:surveyId/insights', auth, getSurveyInsights);
app.get('/api/surveys/:surveyId/revisions', auth, listSurveyRevisions);
app.post('/api/surveys/:surveyId/revisions/:revisionId/restore', auth, restoreSurveyRevision);

app.get('/api/surveys/:surveyId/responses', auth, getSurveyResponses);
app.delete('/api/surveys/:surveyId/responses', auth, deleteResponses);
app.get('/api/surveys/:surveyId/recordings', auth, getSurveyRecordings);

app.post('/api/teams', auth, createTeam);
app.get('/api/teams', auth, getTeams);
app.get('/api/teams/:teamId/members', auth, getTeamMembers);
app.put('/api/teams/:teamId/members/:userId', auth, updateTeamMemberRole);
app.delete('/api/teams/:teamId/members/:userId', auth, removeTeamMember);
app.put('/api/teams/:teamId', auth, updateTeam);
app.delete('/api/teams/:teamId', auth, deleteTeam);

app.post('/api/teams/:teamId/invitations', invitationRateLimit, auth, sendInvitation);
app.get('/api/teams/:teamId/invitations', auth, getTeamInvitations);
app.get('/api/invitations', auth, getUserInvitations);
app.post('/api/invitations/:invitationId/accept', auth, acceptInvitation);
app.post('/api/invitations/:invitationId/reject', auth, rejectInvitation);

app.get('/api/auth/profile', auth, getProfile);
app.put('/api/auth/profile', auth, updateProfile);
app.post('/api/auth/password', auth, updatePassword);
app.get('/api/auth/export', auth, exportAccountData);
app.delete('/api/auth/profile', auth, deleteAccount);

app.post('/api/upload', avatarUploadRateLimit, auth, avatarUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = buildAvatarUrl(req, req.file.filename);
  res.json({ url });
});

app.use(((error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof Error && error.message === 'Not allowed by CORS') {
    res.status(403).json({ message: 'Origin not allowed' });
    return;
  }

  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Uploaded file is too large'
      : error.message;
    res.status(400).json({ message });
    return;
  }

  if (error instanceof Error && error.message.startsWith('Invalid file type')) {
    res.status(400).json({ message: error.message });
    return;
  }

  res.status(500).json({ message: 'Internal server error' });
}) as express.ErrorRequestHandler);
