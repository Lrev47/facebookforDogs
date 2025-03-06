import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
import { 
  createBadRequestError,
  createUnauthorizedError, 
  createConflictError,
  createInternalServerError
} from '../utils/error';
import { LoginDto, RegisterDto, UserResponse, ApiResponse } from '../types';

/**
 * Register a new user
 */
export const register = async (
  req: Request<{}, {}, RegisterDto>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName, dateOfBirth } = req.body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return next(createConflictError('User with this email already exists'));
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        profilePic: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(createInternalServerError('JWT secret is not defined'));
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    const response: ApiResponse<{ user: UserResponse; token: string }> = {
      success: true,
      data: {
        user,
        token
      }
    };

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user
 */
export const login = async (
  req: Request<{}, {}, LoginDto>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(createUnauthorizedError('Invalid credentials'));
    }

    // Check the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createUnauthorizedError('Invalid credentials'));
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(createInternalServerError('JWT secret is not defined'));
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    const response: ApiResponse<{ 
      user: Omit<UserResponse, 'password'>;
      token: string;
    }> = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: user.dateOfBirth,
          profilePic: user.profilePic,
          bio: user.bio,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}; 