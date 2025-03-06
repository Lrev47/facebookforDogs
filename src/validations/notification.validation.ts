import { z } from 'zod';

// Notification ID param schema
export const notificationIdParamSchema = z.object({
  notificationId: z.string().uuid('Invalid notification ID'),
});

// Notification pagination query schema
export const notificationQuerySchema = z.object({
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
export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;
export type NotificationQuery = z.infer<typeof notificationQuerySchema>; 