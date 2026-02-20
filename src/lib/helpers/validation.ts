import { z } from 'zod';
import { AUTH } from '@/lib/config/constants';

// ============================================================
// Shared Zod Validation Schemas
// ============================================================

// Auth schemas
export const emailSchema = z.string().email('Invalid email format').max(255).toLowerCase().trim();

export const passwordSchema = z
  .string()
  .min(AUTH.PASSWORD_RULES.minLength, `Password must be at least ${AUTH.PASSWORD_RULES.minLength} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const displayNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(200, 'Name must be less than 200 characters')
  .trim();

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .toLowerCase()
  .trim();

// Common schemas
export const uuidSchema = z.string().uuid('Invalid ID format');

export const slugSchema = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .trim();

export const urlSchema = z.string().url('Invalid URL').max(2000).optional().or(z.literal(''));

export const bioSchema = z.string().max(500, 'Bio must be less than 500 characters').optional();

// Auth request schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  displayName: displayNameSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// Profile schemas
export const updateProfileSchema = z.object({
  displayName: displayNameSchema.optional(),
  username: usernameSchema.optional(),
  bio: bioSchema,
  title: z.string().max(200).optional(),
  xHandle: z.string().max(100).optional(),
  availability: z.enum(['available', 'busy', 'not_available']).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
});

// Utility: parse request body with schema
export async function parseBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  const body = await request.json();
  return schema.parse(body);
}
