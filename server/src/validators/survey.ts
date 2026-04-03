import { z } from 'zod';

const nullableId = z.union([z.string().trim().min(1), z.null()]).optional();
const jsonValue = z.unknown();

const baseSurveySchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  questions: z.array(z.unknown()).optional(),
  isPublished: z.boolean().optional(),
  folderId: nullableId,
  teamId: nullableId,
  publicCode: z.string().trim().min(1).optional().nullable(),
  welcomeTitle: z.string().optional().nullable(),
  welcomeMessage: z.string().optional().nullable(),
  welcomeInstructions: z.string().optional().nullable(),
  welcomeButtonText: z.string().optional().nullable(),
  thankYouTitle: z.string().optional().nullable(),
  thankYouMessage: z.string().optional().nullable(),
  thankYouButtonText: z.string().optional().nullable(),
  redirectUrl: z.string().optional().nullable(),
  recordingEnabled: z.boolean().optional(),
  recordingRequired: z.boolean().optional(),
  appearance: jsonValue.optional().nullable(),
  branding: jsonValue.optional().nullable(),
  shareMeta: jsonValue.optional().nullable(),
  seo: jsonValue.optional().nullable(),
  settings: jsonValue.optional().nullable(),
  notifications: jsonValue.optional().nullable(),
  retention: jsonValue.optional().nullable(),
  hiddenFields: jsonValue.optional().nullable(),
  computedFields: jsonValue.optional().nullable(),
  automationRules: jsonValue.optional().nullable(),
  delivery: jsonValue.optional().nullable(),
}).strict();

export const surveyCreateSchema = baseSurveySchema.extend({
  name: z.string().trim().min(1).max(255),
});

export const surveyUpdateSchema = baseSurveySchema.refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one survey field must be provided' },
);

const folderBaseSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  order: z.number().int().min(0).optional(),
}).strict();

export const folderCreateSchema = folderBaseSchema.extend({
  name: z.string().trim().min(1).max(120),
});

export const folderUpdateSchema = folderBaseSchema.refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one folder field must be provided' },
);

export const responseDeletionSchema = z.object({
  participantId: z.string().trim().min(1).optional(),
  participantEmail: z.string().trim().email('Participant email must be a valid email address').optional(),
  softDelete: z.boolean().optional(),
}).strict().refine(
  (value) => Boolean(value.participantId || value.participantEmail),
  { message: 'A participantId or participantEmail filter is required' },
);
