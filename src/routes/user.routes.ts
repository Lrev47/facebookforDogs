import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/route';
import { updateProfileSchema, userIdParamSchema } from '../validations/user.validation';

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, asyncHandler(userController.getCurrentUser));

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', 
  authenticate, 
  validate(userIdParamSchema, 'params'),
  asyncHandler(userController.getUserById)
);

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch('/me', 
  authenticate, 
  validate(updateProfileSchema),
  asyncHandler(userController.updateCurrentUser)
);

export default router; 