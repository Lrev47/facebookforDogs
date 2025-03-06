import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AuthRequest, ApiResponse, UserResponse } from '../types';
import { createNotFoundError } from '../utils/error';

/**
 * Get the current user's profile
 */
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createNotFoundError('User not found'));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

    if (!user) {
      return next(createNotFoundError('User not found'));
    }

    const response: ApiResponse<UserResponse> = {
      success: true,
      data: user
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a user by id
 */
export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      return next(createNotFoundError('User not found'));
    }

    const response: ApiResponse<UserResponse> = {
      success: true,
      data: user
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Update the current user's profile
 */
export const updateCurrentUser = async (
  req: AuthRequest & { body: Partial<UserResponse> },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createNotFoundError('User not found'));
    }

    const { firstName, lastName, bio, profilePic } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        bio,
        profilePic
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

    const response: ApiResponse<UserResponse> = {
      success: true,
      data: updatedUser
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}; 