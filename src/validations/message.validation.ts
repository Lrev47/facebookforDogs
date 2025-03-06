import { z } from 'zod';

// Message content validation schema
export const messageContentSchema = z
  .string()
  .min(1, 'Message content cannot be empty')
  .max(2000, 'Message content cannot exceed 2000 characters');

// Create message schema
export const createMessageSchema = z.object({
  content: messageContentSchema,
  receiverId: z.string().uuid('Invalid receiver ID'),
});

// User ID param schema for conversation
export const userIdParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// Message pagination query schema
export const messageQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Page must be a positive number'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
});

// Export types derived from schemas
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type MessageQuery = z.infer<typeof messageQuerySchema>; 