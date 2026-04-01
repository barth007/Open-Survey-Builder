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
} from './controllers/auth.js';
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
  startResponseSession,
  uploadRecording,
} from './controllers/survey.js';
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
import { config } from './config.js';

export const app = express();

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
app.use(express.json({ limit: '10mb' }));

app.use('/uploads/avatars', express.static(avatarUploadsDir));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/system/capabilities', (_req, res) => {
  res.json(config.capabilities);
});

app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

app.get('/api/auth/admin/pending', auth, getPendingProfiles);
app.put('/api/auth/admin/profiles/:id', auth, updateProfileStatus);

app.get('/api/surveys/folders', auth, getFolders);
app.post('/api/surveys/folders', auth, createFolder);
app.put('/api/surveys/folders/:id', auth, updateFolder);
app.delete('/api/surveys/folders/:id', auth, deleteFolder);

app.post('/api/surveys/respond', optionalAuth, submitResponse);
app.post('/api/surveys/:surveyId/response-session', optionalAuth, startResponseSession);

app.post('/api/surveys/recordings/upload', optionalAuth, recordingUpload.single('recording'), uploadRecording);
app.delete('/api/surveys/recordings/:id', auth, deleteRecording);
app.get('/api/surveys/recordings/:id/file', auth, getRecordingFile);

app.get('/api/surveys', auth, getSurveys);
app.get('/api/surveys/public/:publicCode', getSurveyByPublicCode);
app.post('/api/surveys', auth, createSurvey);

app.get('/api/surveys/:id', optionalAuth, getSurveyById);
app.put('/api/surveys/:id', auth, updateSurvey);
app.delete('/api/surveys/:id', auth, deleteSurvey);

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

app.post('/api/teams/:teamId/invitations', auth, sendInvitation);
app.get('/api/teams/:teamId/invitations', auth, getTeamInvitations);
app.get('/api/invitations', auth, getUserInvitations);
app.post('/api/invitations/:invitationId/accept', auth, acceptInvitation);
app.post('/api/invitations/:invitationId/reject', auth, rejectInvitation);

app.get('/api/auth/profile', auth, getProfile);
app.put('/api/auth/profile', auth, updateProfile);
app.post('/api/auth/password', auth, updatePassword);
app.get('/api/auth/export', auth, exportAccountData);
app.delete('/api/auth/profile', auth, deleteAccount);

app.post('/api/upload', auth, avatarUpload.single('file'), (req, res) => {
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

  const message = error instanceof Error ? error.message : 'Internal server error';
  res.status(500).json({ message });
}) as express.ErrorRequestHandler);
