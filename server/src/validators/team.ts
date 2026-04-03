import { z } from 'zod';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizedEmailSchema = z.string().trim().toLowerCase().refine(
  (value) => EMAIL_PATTERN.test(value),
  { message: 'A valid email address is required' },
);

const roleSchema = z.string().refine(
  (value): value is 'admin' | 'member' => value === 'admin' || value === 'member',
  { message: 'Invitation role must be admin or member' },
);

const teamNameSchema = z
  .string()
  .trim()
  .min(3, 'Team name must be at least 3 characters long')
  .max(120, 'Team name must be 120 characters or fewer');

const teamDescriptionSchema = z.union([
  z.string().max(500, 'Team description must be 500 characters or fewer'),
  z.null(),
]).optional();

export const teamCreateSchema = z.object({
  name: teamNameSchema,
  description: teamDescriptionSchema,
}).strict();

export const teamUpdateSchema = z.object({
  name: teamNameSchema.optional(),
  description: teamDescriptionSchema,
}).strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one team field must be provided' },
);

export const getValidationMessage = (issues: { message?: string }[]) => (
  issues[0]?.message || 'Invalid request body'
);

export const parseInvitationPayload = (payload: unknown) => {
  const invitationSchema = z.object({
    email: normalizedEmailSchema,
    role: roleSchema.optional(),
  }).strict();

  const parsed = invitationSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false as const,
      message: getValidationMessage(parsed.error.issues),
    };
  }

  return {
    success: true as const,
    data: parsed.data,
  };
};

export const parseRoleUpdatePayload = (payload: unknown) => {
  const roleUpdateSchema = z.object({
    role: z.string().refine(
      (value): value is 'admin' | 'member' => value === 'admin' || value === 'member',
      { message: 'Role must be admin or member' },
    ),
  }).strict();

  const parsed = roleUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false as const,
      message: getValidationMessage(parsed.error.issues),
    };
  }

  return {
    success: true as const,
    data: parsed.data,
  };
};
