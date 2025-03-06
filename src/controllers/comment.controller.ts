import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AuthRequest, ApiResponse, CreateCommentDto, UpdateCommentDto } from '../types';
import { createNotFoundError, createForbiddenError } from '../utils/error';

/**
 * Get comments for a specific post
 */
export const getCommentsByPostId = async (
  req: Request<{ postId: string }, {}, {}, { page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return next(createNotFoundError('Post not found'));
    }

    // Get comments for the post
    const comments = await prisma.comment.findMany({
      where: { postId },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    });

    const totalComments = await prisma.comment.count({
      where: { postId }
    });

    const totalPages = Math.ceil(totalComments / limit);

    const response: ApiResponse<{
      comments: any[];
      pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalItems: number;
      };
    }> = {
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          totalPages,
          totalItems: totalComments
        }
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new comment
 */
export const createComment = async (
  req: AuthRequest & { body: CreateCommentDto },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { content, postId } = req.body;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return next(createNotFoundError('Post not found'));
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        post: {
          connect: { id: postId }
        },
        author: {
          connect: { id: req.user.id }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        }
      }
    });

    // Create a notification for the post owner if it's a different user
    if (post.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          type: 'COMMENT',
          content: `${req.user.firstName} ${req.user.lastName} commented on your post`,
          user: {
            connect: { id: post.authorId }
          }
        }
      });
    }

    const response: ApiResponse<any> = {
      success: true,
      data: comment
    };

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a comment
 */
export const updateComment = async (
  req: AuthRequest & { body: UpdateCommentDto, params: { id: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { id } = req.params;
    const { content } = req.body;

    // Check if the comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: {
        authorId: true
      }
    });

    if (!comment) {
      return next(createNotFoundError('Comment not found'));
    }

    if (comment.authorId !== req.user.id) {
      return next(createForbiddenError('You are not authorized to update this comment'));
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        }
      }
    });

    const response: ApiResponse<any> = {
      success: true,
      data: updatedComment
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (
  req: AuthRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { id } = req.params;

    // Check if the comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: {
        authorId: true,
        postId: true
      }
    });

    if (!comment) {
      return next(createNotFoundError('Comment not found'));
    }

    // Allow comment deletion if the user is the comment author or the post owner
    const post = await prisma.post.findUnique({
      where: { id: comment.postId },
      select: { authorId: true }
    });

    if (comment.authorId !== req.user.id && post?.authorId !== req.user.id) {
      return next(createForbiddenError('You are not authorized to delete this comment'));
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id }
    });

    const response: ApiResponse<null> = {
      success: true
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}; 