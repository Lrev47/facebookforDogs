import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/route';
import {
  createMessageSchema,
  userIdParamSchema,
  messageQuerySchema
} from '../validations/message.validation';

const router = Router();

/**
 * @route   GET /api/messages
 * @desc    Get all conversations for the current user
 * @access  Private
 */
router.get('/', authenticate, asyncHandler(messageController.getConversations));

/**
 * @route   GET /api/messages/:userId
 * @desc    Get conversation with a specific user
 * @access  Private
 */
router.get('/:userId',
  authenticate,
  validate(userIdParamSchema, 'params'),
  validate(messageQuerySchema, 'query'),
  asyncHandler(messageController.getConversation)
);

/**
 * @route   POST /api/messages
 * @desc    Send a message to another user
 * @access  Private
 */
router.post('/',
  authenticate,
  validate(createMessageSchema),
  asyncHandler(messageController.sendMessage)
);

export default router; 