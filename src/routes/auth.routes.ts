import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/route';
import { loginSchema, registerSchema } from '../validations/auth.validation';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', 
  validate(registerSchema), 
  asyncHandler(authController.register)
);

/**
 * @route   POST /api/auth/login
 * @desc    Login a user
 * @access  Public
 */
router.post('/login', 
  validate(loginSchema), 
  asyncHandler(authController.login)
);

export default router; 