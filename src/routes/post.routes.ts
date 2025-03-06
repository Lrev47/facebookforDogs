import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/route';
import { 
  createPostSchema, 
  updatePostSchema, 
  postIdSchema, 
  postsQuerySchema 
} from '../validations/post.validation';

const router = Router();

/**
 * @route   GET /api/posts
 * @desc    Get all posts with pagination
 * @access  Private
 */
router.get('/', 
  authenticate, 
  validate(postsQuerySchema, 'query'),
  asyncHandler(postController.getPosts)
);

/**
 * @route   GET /api/posts/:id
 * @desc    Get post by ID
 * @access  Private
 */
router.get('/:id', 
  authenticate, 
  validate(postIdSchema, 'params'),
  asyncHandler(postController.getPostById)
);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/', 
  authenticate, 
  validate(createPostSchema),
  asyncHandler(postController.createPost)
);

/**
 * @route   PATCH /api/posts/:id
 * @desc    Update a post
 * @access  Private
 */
router.patch('/:id', 
  authenticate, 
  validate(postIdSchema, 'params'),
  validate(updatePostSchema),
  asyncHandler(postController.updatePost)
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete('/:id', 
  authenticate, 
  validate(postIdSchema, 'params'),
  asyncHandler(postController.deletePost)
);

export default router; 