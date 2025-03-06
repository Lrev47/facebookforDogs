import { z } from 'zod';

// Comment content validation schema
export const commentContentSchema = z
  .string()
  .min(1, 'Comment content cannot be empty')
  .max(1000, 'Comment content cannot exceed 1000 characters');

// Create comment schema
export const createCommentSchema = z.object({
  content: commentContentSchema,
  postId: z.string().uuid('Invalid post ID'),
});

// Update comment schema
export const updateCommentSchema = z.object({
  content: commentContentSchema,
});

// Comment ID schema for route parameters
export const commentIdSchema = z.object({
  id: z.string().uuid('Invalid comment ID'),
});

// Post ID param schema for getting comments by post
export const postIdParamSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
});

// Comments query schema
export const commentsQuerySchema = z.object({
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
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CommentIdParam = z.infer<typeof commentIdSchema>;
export type PostIdParam = z.infer<typeof postIdParamSchema>;
export type CommentsQuery = z.infer<typeof commentsQuerySchema>; 