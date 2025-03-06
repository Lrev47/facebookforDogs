import { Router } from 'express';
import * as friendController from '../controllers/friend.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/route';
import {
  friendRequestSchema,
  friendRequestStatusSchema,
  requestIdParamSchema,
  userIdParamSchema
} from '../validations/friend.validation';

const router = Router();

/**
 * @route   GET /api/friends/requests
 * @desc    Get all friend requests for the current user
 * @access  Private
 */
router.get('/requests', authenticate, asyncHandler(friendController.getFriendRequests));

/**
 * @route   GET /api/friends
 * @desc    Get all friends of the current user
 * @access  Private
 */
router.get('/', authenticate, asyncHandler(friendController.getFriends));

/**
 * @route   POST /api/friends/requests
 * @desc    Send a friend request
 * @access  Private
 */
router.post('/requests',
  authenticate,
  validate(friendRequestSchema),
  asyncHandler(friendController.sendFriendRequest)
);

/**
 * @route   PATCH /api/friends/requests/:requestId
 * @desc    Respond to a friend request (accept or reject)
 * @access  Private
 */
router.patch('/requests/:requestId',
  authenticate,
  validate(requestIdParamSchema, 'params'),
  validate(friendRequestStatusSchema),
  asyncHandler(friendController.respondToFriendRequest)
);

/**
 * @route   DELETE /api/friends/:userId
 * @desc    Cancel a friend request or remove a friend
 * @access  Private
 */
router.delete('/:userId',
  authenticate,
  validate(userIdParamSchema, 'params'),
  asyncHandler(friendController.deleteFriendship)
);

export default router; 