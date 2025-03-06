import { z } from 'zod';

// Common URLs regex
const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// Post content validation schema
export const contentSchema = z
  .string()
  .min(1, 'Content cannot be empty')
  .max(5000, 'Content cannot exceed 5000 characters');

// Create post schema
export const createPostSchema = z.object({
  content: contentSchema,
  imageUrl: z
    .string()
    .regex(urlRegex, 'Invalid URL format')
    .url('Invalid URL')
    .optional()
    .nullable(),
});

// Update post schema
export const updatePostSchema = z.object({
  content: contentSchema.optional(),
  imageUrl: z
    .string()
    .regex(urlRegex, 'Invalid URL format')
    .url('Invalid URL')
    .optional()
    .nullable(),
}).refine(data => data.content !== undefined || data.imageUrl !== undefined, {
  message: 'At least one field (content or imageUrl) must be provided',
});

// Post ID schema for route parameters
export const postIdSchema = z.object({
  id: z.string().uuid('Invalid post ID'),
});

// Posts query schema
export const postsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Page must be a positive number'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
});

// Export types derived from schemas
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostIdParam = z.infer<typeof postIdSchema>;
export type PostsQuery = z.infer<typeof postsQuerySchema>; 