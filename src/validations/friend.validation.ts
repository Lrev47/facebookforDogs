import { z } from 'zod';
import { FriendStatus } from '@prisma/client';

// Friend request schema
export const friendRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// Friend request status schema
export const friendRequestStatusSchema = z.object({
  status: z.enum([FriendStatus.ACCEPTED, FriendStatus.REJECTED], {
    errorMap: () => ({ message: 'Status must be either ACCEPTED or REJECTED' }),
  }),
});

// Friend request ID param schema
export const requestIdParamSchema = z.object({
  requestId: z.string().uuid('Invalid friend request ID'),
});

// User ID param schema
export const userIdParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// Export types derived from schemas
export type FriendRequestInput = z.infer<typeof friendRequestSchema>;
export type FriendRequestStatusInput = z.infer<typeof friendRequestStatusSchema>;
export type RequestIdParam = z.infer<typeof requestIdParamSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>; 