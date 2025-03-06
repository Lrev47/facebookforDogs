import { Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AuthRequest, ApiResponse } from '../types';
import { createNotFoundError, createForbiddenError, createBadRequestError } from '../utils/error';

/**
 * Like or unlike a post
 */
export const togglePostLike = async (
  req: AuthRequest & { params: { postId: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { postId } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true
      }
    });

    if (!post) {
      return next(createNotFoundError('Post not found'));
    }

    // Check if the user has already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: req.user.id,
        postId
      }
    });

    let result;
    let isLiked;

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      isLiked = false;
    } else {
      // Like the post
      result = await prisma.like.create({
        data: {
          user: {
            connect: { id: req.user.id }
          },
          post: {
            connect: { id: postId }
          }
        }
      });
      isLiked = true;

      // Create a notification for the post owner if it's a different user
      if (post.authorId !== req.user.id) {
        await prisma.notification.create({
          data: {
            type: 'POST_LIKE',
            content: `${req.user.firstName} ${req.user.lastName} liked your post`,
            user: {
              connect: { id: post.authorId }
            }
          }
        });
      }
    }

    // Get the updated like count
    const likeCount = await prisma.like.count({
      where: { postId }
    });

    const response: ApiResponse<{ isLiked: boolean; likeCount: number }> = {
      success: true,
      data: {
        isLiked,
        likeCount
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Like or unlike a comment
 */
export const toggleCommentLike = async (
  req: AuthRequest & { params: { commentId: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { commentId } = req.params;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true
      }
    });

    if (!comment) {
      return next(createNotFoundError('Comment not found'));
    }

    // Check if the user has already liked the comment
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: req.user.id,
        commentId
      }
    });

    let result;
    let isLiked;

    if (existingLike) {
      // Unlike the comment
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      isLiked = false;
    } else {
      // Like the comment
      result = await prisma.like.create({
        data: {
          user: {
            connect: { id: req.user.id }
          },
          comment: {
            connect: { id: commentId }
          }
        }
      });
      isLiked = true;

      // Create a notification for the comment owner if it's a different user
      if (comment.authorId !== req.user.id) {
        await prisma.notification.create({
          data: {
            type: 'COMMENT_LIKE',
            content: `${req.user.firstName} ${req.user.lastName} liked your comment`,
            user: {
              connect: { id: comment.authorId }
            }
          }
        });
      }
    }

    // Get the updated like count
    const likeCount = await prisma.like.count({
      where: { commentId }
    });

    const response: ApiResponse<{ isLiked: boolean; likeCount: number }> = {
      success: true,
      data: {
        isLiked,
        likeCount
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users who liked a post
 */
export const getPostLikes = async (
  req: AuthRequest & { params: { postId: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return next(createNotFoundError('Post not found'));
    }

    // Get all users who liked the post
    const likes = await prisma.like.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        }
      }
    });

    const response: ApiResponse<any[]> = {
      success: true,
      data: likes.map(like => like.user)
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}; 