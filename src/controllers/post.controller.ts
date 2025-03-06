import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AuthRequest, ApiResponse, CreatePostDto, UpdatePostDto } from '../types';
import { createNotFoundError, createForbiddenError } from '../utils/error';

/**
 * Get all posts with pagination
 */
export const getPosts = async (
  req: Request<{}, {}, {}, { page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
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
            comments: true,
            likes: true
          }
        }
      }
    });

    const totalPosts = await prisma.post.count();
    const totalPages = Math.ceil(totalPosts / limit);

    const response: ApiResponse<{
      posts: any[];
      pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalItems: number;
      };
    }> = {
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          totalPages,
          totalItems: totalPosts
        }
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a post by id
 */
export const getPostById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePic: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    });

    if (!post) {
      return next(createNotFoundError('Post not found'));
    }

    const response: ApiResponse<any> = {
      success: true,
      data: post
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new post
 */
export const createPost = async (
  req: AuthRequest & { body: CreatePostDto },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { content, imageUrl } = req.body;

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
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

    const response: ApiResponse<any> = {
      success: true,
      data: post
    };

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a post
 */
export const updatePost = async (
  req: AuthRequest & { body: UpdatePostDto, params: { id: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { id } = req.params;
    const { content, imageUrl } = req.body;

    // Check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        authorId: true
      }
    });

    if (!post) {
      return next(createNotFoundError('Post not found'));
    }

    if (post.authorId !== req.user.id) {
      return next(createForbiddenError('You are not authorized to update this post'));
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        content,
        imageUrl
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

    const response: ApiResponse<any> = {
      success: true,
      data: updatedPost
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a post
 */
export const deletePost = async (
  req: AuthRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(createForbiddenError('User not authenticated'));
    }

    const { id } = req.params;

    // Check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        authorId: true
      }
    });

    if (!post) {
      return next(createNotFoundError('Post not found'));
    }

    if (post.authorId !== req.user.id) {
      return next(createForbiddenError('You are not authorized to delete this post'));
    }

    await prisma.post.delete({
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