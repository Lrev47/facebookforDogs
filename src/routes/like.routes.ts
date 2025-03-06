import { Router } from 'express';
import * as likeController from '../controllers/like.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/route';
import {
  postIdParamSchema,
  commentIdParamSchema
} from '../validations/like.validation';

const router = Router();

/**
 * @route   POST /api/likes/post/:postId
 * @desc    Like or unlike a post
 * @access  Private
 */
router.post('/post/:postId',
  authenticate,
  validate(postIdParamSchema, 'params'),
  asyncHandler(likeController.togglePostLike)
);

/**
 * @route   POST /api/likes/comment/:commentId
 * @desc    Like or unlike a comment
 * @access  Private
 */
router.post('/comment/:commentId',
  authenticate,
  validate(commentIdParamSchema, 'params'),
  asyncHandler(likeController.toggleCommentLike)
);

/**
 * @route   GET /api/likes/post/:postId
 * @desc    Get all users who liked a post
 * @access  Private
 */
router.get('/post/:postId',
  authenticate,
  validate(postIdParamSchema, 'params'),
  asyncHandler(likeController.getPostLikes)
);

export default router; 