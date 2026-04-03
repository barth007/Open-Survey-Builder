import { z } from 'zod';

const surveyInsightEventTypeSchema = z.enum([
  'form_view',
  'form_start',
  'question_reached',
  'form_submit',
]);

export const surveyInsightEventSchema = z.object({
  sessionId: z.string().trim().min(1).max(128),
  eventType: surveyInsightEventTypeSchema,
  questionId: z.string().trim().min(1).max(255).optional(),
  pageIndex: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const getValidationMessage = (issues: { message?: string }[]) => (
  issues[0]?.message || 'Invalid request body'
);
