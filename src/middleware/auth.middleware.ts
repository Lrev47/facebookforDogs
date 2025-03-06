import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createUnauthorizedError, createForbiddenError } from '../utils/error';
import { AuthRequest, JwtPayload } from '../types';
import prisma from '../utils/db';

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createUnauthorizedError('Authentication required'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(createUnauthorizedError('Authentication required'));
    }

    // Verify the token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(createUnauthorizedError('Server authentication configuration error'));
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      return next(createForbiddenError('User no longer exists'));
    }

    // Attach the user to the request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createUnauthorizedError('Invalid token'));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(createUnauthorizedError('Token expired'));
    }
    next(error);
  }
}; 