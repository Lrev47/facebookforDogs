import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AuthRequest, ApiResponse, FriendStatus } from '../types';
import { 
  createNotFoundError, 
  createForbiddenError, 
  createBadRequestError,
  createConflictError
} from '../utils/error';

/**
 * Get all friend requests for the current user
 */
export const getFriendRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    // Get received friend requests (that are pending)
    const receivedRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: req.user.id,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        }
      }
    });

    // Get sent friend requests (any status)
    const sentRequests = await prisma.friendRequest.findMany({
      where: {
        senderId: req.user.id
      },
      include: {
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

    const response: ApiResponse<{
      received: any[];
      sent: any[];
    }> = {
      success: true,
      data: {
        received: receivedRequests,
        sent: sentRequests
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all friends of the current user
 */
export const getFriends = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    // Get accepted friend requests where the user is the sender
    const sentRequests = await prisma.friendRequest.findMany({
      where: {
        senderId: req.user.id,
        status: 'ACCEPTED'
      },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
            bio: true
          }
        }
      }
    });

    // Get accepted friend requests where the user is the receiver
    const receivedRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: req.user.id,
        status: 'ACCEPTED'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
            bio: true
          }
        }
      }
    });

    // Combine the results to get all friends
    const friends = [
      ...sentRequests.map(request => request.receiver),
      ...receivedRequests.map(request => request.sender)
    ];

    const response: ApiResponse<any[]> = {
      success: true,
      data: friends
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Send a friend request
 */
export const sendFriendRequest = async (
  req: AuthRequest & { body: { userId: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { userId } = req.body;

    // Cannot send friend request to self
    if (userId === req.user.id) {
      return next(createBadRequestError('Cannot send a friend request to yourself'));
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return next(createNotFoundError('User not found'));
    }

    // Check if a friend request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
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

    if (existingRequest) {
      return next(createConflictError('A friend request already exists between these users'));
    }

    // Create the friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        sender: {
          connect: { id: req.user.id }
        },
        receiver: {
          connect: { id: userId }
        },
        status: 'PENDING'
      },
      include: {
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
        type: 'FRIEND_REQUEST',
        content: `${req.user.firstName} ${req.user.lastName} sent you a friend request`,
        user: {
          connect: { id: userId }
        }
      }
    });

    const response: ApiResponse<any> = {
      success: true,
      data: friendRequest
    };

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Respond to a friend request (accept or reject)
 */
export const respondToFriendRequest = async (
  req: AuthRequest & { params: { requestId: string }, body: { status: FriendStatus } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { requestId } = req.params;
    const { status } = req.body;

    // Validate the status
    if (status !== 'ACCEPTED' && status !== 'REJECTED') {
      return next(createBadRequestError('Invalid status. Must be ACCEPTED or REJECTED'));
    }

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!friendRequest) {
      return next(createNotFoundError('Friend request not found'));
    }

    // Only the receiver can accept or reject the request
    if (friendRequest.receiverId !== req.user.id) {
      return next(createForbiddenError('You are not authorized to respond to this friend request'));
    }

    // Update the friend request status
    const updatedRequest = await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status },
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

    // Create a notification for the sender
    if (status === 'ACCEPTED') {
      await prisma.notification.create({
        data: {
          type: 'FRIEND_REQUEST',
          content: `${req.user.firstName} ${req.user.lastName} accepted your friend request`,
          user: {
            connect: { id: friendRequest.sender.id }
          }
        }
      });
    }

    const response: ApiResponse<any> = {
      success: true,
      data: updatedRequest
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a friend request or remove a friend
 */
export const deleteFriendship = async (
  req: AuthRequest & { params: { userId: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { userId } = req.params;

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findFirst({
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

    if (!friendRequest) {
      return next(createNotFoundError('Friend request or friendship not found'));
    }

    // Delete the friend request
    await prisma.friendRequest.delete({
      where: { id: friendRequest.id }
    });

    const response: ApiResponse<null> = {
      success: true
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}; 