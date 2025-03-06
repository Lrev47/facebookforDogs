import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/route';
import {
  notificationIdParamSchema,
  notificationQuerySchema
} from '../validations/notification.validation';

const router = Router();

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the current user
 * @access  Private
 */
router.get('/',
  authenticate,
  validate(notificationQuerySchema, 'query'),
  asyncHandler(notificationController.getNotifications)
);

/**
 * @route   PATCH /api/notifications/:notificationId
 * @desc    Mark a notification as read
 * @access  Private
 */
router.patch('/:notificationId',
  authenticate,
  validate(notificationIdParamSchema, 'params'),
  asyncHandler(notificationController.markNotificationAsRead)
);

/**
 * @route   PATCH /api/notifications/read/all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/read/all', authenticate, asyncHandler(notificationController.markAllNotificationsAsRead));

export default router; 