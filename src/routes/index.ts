import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import postRoutes from './post.routes';
import commentRoutes from './comment.routes';
import likeRoutes from './like.routes';
import friendRoutes from './friend.routes';
import messageRoutes from './message.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Define API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/likes', likeRoutes);
router.use('/friends', friendRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);

export default router; 