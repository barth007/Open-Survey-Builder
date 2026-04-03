import { z } from 'zod';

const EMAIL_ERROR_MESSAGE = 'A valid email address is required';
const PASSWORD_LENGTH_ERROR_MESSAGE = 'Password must be between 6 and 72 characters long';
const CURRENT_PASSWORD_REQUIRED_MESSAGE = 'Current password is required';
const CURRENT_PASSWORD_LENGTH_ERROR_MESSAGE = 'Current password must be 72 characters or fewer';
const NAME_LENGTH_ERROR_MESSAGE = 'Name must be 120 characters or fewer';
const AVATAR_URL_LENGTH_ERROR_MESSAGE = 'Avatar URL must be 2048 characters or fewer';
const PROFILE_UPDATE_REQUIRED_MESSAGE = 'At least one profile field must be provided';
const STATUS_ERROR_MESSAGE = 'Status must be pending, approved, or rejected';

const emailSchema = z.string().trim().email(EMAIL_ERROR_MESSAGE);

const passwordSchema = z
  .string()
  .min(6, PASSWORD_LENGTH_ERROR_MESSAGE)
  .max(72, PASSWORD_LENGTH_ERROR_MESSAGE);

const currentPasswordSchema = z
  .string()
  .min(1, CURRENT_PASSWORD_REQUIRED_MESSAGE)
  .max(72, CURRENT_PASSWORD_LENGTH_ERROR_MESSAGE);

const optionalNameSchema = z
  .string()
  .trim()
  .min(1, 'Name cannot be empty')
  .max(120, NAME_LENGTH_ERROR_MESSAGE)
  .optional();

const nullableProfileNameSchema = z.union([
  z.string().trim().min(1, 'Name cannot be empty').max(120, NAME_LENGTH_ERROR_MESSAGE),
  z.null(),
]).optional();

const nullableAvatarUrlSchema = z.union([
  z.string().trim().min(1, 'Avatar URL cannot be empty').max(2048, AVATAR_URL_LENGTH_ERROR_MESSAGE),
  z.null(),
]).optional();

const statusSchema = z.string().refine(
  (value): value is 'pending' | 'approved' | 'rejected' => (
    value === 'pending' || value === 'approved' || value === 'rejected'
  ),
  { message: STATUS_ERROR_MESSAGE },
);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: optionalNameSchema,
}).strict();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(72, CURRENT_PASSWORD_LENGTH_ERROR_MESSAGE),
}).strict();

export const profileUpdateSchema = z.object({
  name: nullableProfileNameSchema,
  avatarUrl: nullableAvatarUrlSchema,
  emailNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
}).strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: PROFILE_UPDATE_REQUIRED_MESSAGE },
);

export const adminProfileStatusSchema = z.object({
  status: statusSchema,
}).strict();

export const updatePasswordSchema = z.object({
  currentPassword: currentPasswordSchema,
  password: passwordSchema,
}).strict();

export const deleteAccountSchema = z.object({
  currentPassword: currentPasswordSchema,
  confirmation: z.string().refine(
    (value) => value === 'DELETE',
    { message: 'Deletion confirmation must match DELETE' },
  ),
}).strict();

export const getValidationMessage = (issues: { message?: string }[]) => (
  issues[0]?.message || 'Invalid request body'
);
