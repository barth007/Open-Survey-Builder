import { z } from 'zod';

const nullableId = z.union([z.string().trim().min(1), z.null()]).optional();

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
}).strict();

export const surveyCreateSchema = baseSurveySchema.extend({
  name: z.string().trim().min(1).max(255),
});

export const surveyUpdateSchema = baseSurveySchema.refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one survey field must be provided' },
);
