import { z } from 'zod';
import { nameSchema } from './auth.validation';

// Common URLs regex for profile pictures
const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// Bio validation schema
export const bioSchema = z
  .string()
  .max(500, 'Bio cannot exceed 500 characters')
  .optional()
  .nullable();

// Profile picture validation schema
export const profilePicSchema = z
  .string()
  .regex(urlRegex, 'Invalid URL format')
  .url('Invalid URL')
  .optional()
  .nullable();

// User profile update schema
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  bio: bioSchema,
  profilePic: profilePicSchema,
}).refine(data => 
  data.firstName !== undefined || 
  data.lastName !== undefined || 
  data.bio !== undefined || 
  data.profilePic !== undefined, {
    message: 'At least one field must be provided for update',
});

// User ID param schema
export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

// Export types derived from schemas
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>; 