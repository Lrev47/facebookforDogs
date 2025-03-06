import { Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AuthRequest, ApiResponse } from '../types';
import { createNotFoundError, createForbiddenError } from '../utils/error';

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (
  req: AuthRequest & { query: { page?: string, limit?: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '20');
    const skip = (page - 1) * limit;

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Count total notifications
    const totalNotifications = await prisma.notification.count({
      where: {
        userId: req.user.id
      }
    });

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false
      }
    });

    const totalPages = Math.ceil(totalNotifications / limit);

    const response: ApiResponse<{
      notifications: any[];
      unreadCount: number;
      pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalItems: number;
      };
    }> = {
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          totalPages,
          totalItems: totalNotifications
        }
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  req: AuthRequest & { params: { notificationId: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { notificationId } = req.params;

    // Check if notification exists and belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return next(createNotFoundError('Notification not found'));
    }

    if (notification.userId !== req.user.id) {
      return next(createForbiddenError('You are not authorized to access this notification'));
    }

    // Mark as read
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    const response: ApiResponse<any> = {
      success: true,
      data: updatedNotification
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    // Update all unread notifications for this user
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    const response: ApiResponse<{ success: true }> = {
      success: true,
      data: { success: true }
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}; 