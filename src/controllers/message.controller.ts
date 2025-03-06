import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AuthRequest, ApiResponse, CreateMessageDto } from '../types';
import { createNotFoundError, createForbiddenError } from '../utils/error';

/**
 * Get conversation between current user and another user
 */
export const getConversation = async (
  req: AuthRequest & { params: { userId: string }, query: { page?: string, limit?: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { userId } = req.params;
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '20');
    const skip = (page - 1) * limit;

    // Check if other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePic: true
      }
    });

    if (!otherUser) {
      return next(createNotFoundError('User not found'));
    }

    // Get messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: req.user.id,
            receiverId: userId
          },
          {
            senderId: userId,
            receiverId: req.user.id
          }
        ]
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        }
      }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: req.user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    const totalMessages = await prisma.message.count({
      where: {
        OR: [
          {
            senderId: req.user.id,
            receiverId: userId
          },
          {
            senderId: userId,
            receiverId: req.user.id
          }
        ]
      }
    });

    const totalPages = Math.ceil(totalMessages / limit);

    const response: ApiResponse<{
      otherUser: any;
      messages: any[];
      pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalItems: number;
      };
    }> = {
      success: true,
      data: {
        otherUser,
        messages,
        pagination: {
          page,
          limit,
          totalPages,
          totalItems: totalMessages
        }
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all conversations for current user
 */
export const getConversations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    // Get unique users that the current user has messaged with
    const sentToUsers = await prisma.message.findMany({
      where: {
        senderId: req.user.id
      },
      select: {
        receiverId: true
      },
      distinct: ['receiverId']
    });

    const receivedFromUsers = await prisma.message.findMany({
      where: {
        receiverId: req.user.id
      },
      select: {
        senderId: true
      },
      distinct: ['senderId']
    });

    // Combine and deduplicate user IDs
    const userIds = new Set([
      ...sentToUsers.map(msg => msg.receiverId),
      ...receivedFromUsers.map(msg => msg.senderId)
    ]);

    // Get user details and latest message for each conversation
    const conversations = await Promise.all(
      Array.from(userIds).map(async (userId) => {
        const otherUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        });

        // Get the latest message
        const latestMessage = await prisma.message.findFirst({
          where: {
            OR: [
              {
                senderId: req.user?.id,
                receiverId: userId
              },
              {
                senderId: userId,
                receiverId: req.user?.id
              }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            senderId: userId,
            receiverId: req.user?.id,
            isRead: false
          }
        });

        return {
          user: otherUser,
          latestMessage,
          unreadCount
        };
      })
    );

    // Sort conversations by latest message time
    conversations.sort((a, b) => {
      if (!a.latestMessage || !b.latestMessage) return 0;
      return b.latestMessage.createdAt.getTime() - a.latestMessage.createdAt.getTime();
    });

    const response: ApiResponse<any[]> = {
      success: true,
      data: conversations
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message to another user
 */
export const sendMessage = async (
  req: AuthRequest & { body: CreateMessageDto },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { content, receiverId } = req.body;

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return next(createNotFoundError('Receiver not found'));
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        sender: {
          connect: { id: req.user.id }
        },
        receiver: {
          connect: { id: receiverId }
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        }
      }
    });

    // Create a notification for the receiver
    await prisma.notification.create({
      data: {
        type: 'MESSAGE',
        content: `${req.user.firstName} ${req.user.lastName} sent you a message`,
        user: {
          connect: { id: receiverId }
        }
      }
    });

    const response: ApiResponse<any> = {
      success: true,
      data: message
    };

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}; 