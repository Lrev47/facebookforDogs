import { Request } from 'express';
import { 
  User, 
  Post, 
  Comment, 
  Like, 
  FriendRequest, 
  Message, 
  Notification, 
  FriendStatus, 
  NotificationType 
} from '@prisma/client';

// Re-export Prisma types
export type {
  User, 
  Post, 
  Comment, 
  Like, 
  FriendRequest, 
  Message, 
  Notification, 
  FriendStatus, 
  NotificationType
};

// Extended Request type with user information
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// Application error types
export enum ErrorType {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER = 'INTERNAL_SERVER',
  VALIDATION = 'VALIDATION'
}

export interface AppError extends Error {
  type: ErrorType;
  statusCode: number;
  isOperational: boolean;
  details?: Record<string, any>;
}

// Auth types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
}

export interface JwtPayload {
  id: string;
  email: string;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    type: ErrorType;
    details?: Record<string, any>;
  };
}

// DTO types for User
export type UserResponse = Omit<User, 'password'>;

// DTO types for Post
export interface CreatePostDto {
  content: string;
  imageUrl?: string;
}

export interface UpdatePostDto {
  content?: string;
  imageUrl?: string;
}

// DTO types for Comment
export interface CreateCommentDto {
  content: string;
  postId: string;
}

export interface UpdateCommentDto {
  content: string;
}

// DTO types for Friend Request
export interface FriendRequestResponse {
  id: string;
  status: FriendStatus;
  createdAt: Date;
  sender: UserResponse;
  receiver: UserResponse;
}

// DTO types for Message
export interface CreateMessageDto {
  content: string;
  receiverId: string;
}

export interface MessageResponse {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender: UserResponse;
  receiver: UserResponse;
} 