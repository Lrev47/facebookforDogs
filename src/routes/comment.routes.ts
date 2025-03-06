import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/route';
import {
  createCommentSchema,
  updateCommentSchema,
  commentIdSchema,
  postIdParamSchema,
  commentsQuerySchema
} from '../validations/comment.validation';

const router = Router();

/**
 * @route   GET /api/comments/post/:postId
 * @desc    Get comments for a specific post
 * @access  Private
 */
router.get('/post/:postId',
  authenticate,
  validate(postIdParamSchema, 'params'),
  validate(commentsQuerySchema, 'query'),
  asyncHandler(commentController.getCommentsByPostId)
);

/**
 * @route   POST /api/comments
 * @desc    Create a new comment
 * @access  Private
 */
router.post('/',
  authenticate,
  validate(createCommentSchema),
  asyncHandler(commentController.createComment)
);

/**
 * @route   PATCH /api/comments/:id
 * @desc    Update a comment
 * @access  Private
 */
router.patch('/:id',
  authenticate,
  validate(commentIdSchema, 'params'),
  validate(updateCommentSchema),
  asyncHandler(commentController.updateComment)
);

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment
 * @access  Private
 */
router.delete('/:id',
  authenticate,
  validate(commentIdSchema, 'params'),
  asyncHandler(commentController.deleteComment)
);

export default router; 