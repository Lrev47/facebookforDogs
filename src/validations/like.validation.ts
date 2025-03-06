import { z } from 'zod';

// Post ID param schema for like operations
export const postIdParamSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
});

// Comment ID param schema for like operations
export const commentIdParamSchema = z.object({
  commentId: z.string().uuid('Invalid comment ID'),
});

// Export types derived from schemas
export type PostIdParam = z.infer<typeof postIdParamSchema>;
export type CommentIdParam = z.infer<typeof commentIdParamSchema>; 