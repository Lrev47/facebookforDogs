# Facebook Clone API

A RESTful API for a social media platform similar to Facebook, built with Node.js, Express, TypeScript, and Prisma ORM.

## Features

- **User Management**: Registration, authentication, and profile management
- **Posts**: Create, read, update, and delete posts
- **Social Interactions**: Comments, likes, and friend requests
- **Messaging**: Private messaging between users
- **Notifications**: Activity notifications for social interactions

## Technologies

- **Node.js & Express**: Server framework
- **TypeScript**: Type-safe JavaScript
- **Prisma ORM**: Database access and migrations
- **PostgreSQL**: Database
- **JWT**: Authentication
- **bcrypt**: Password hashing

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd facebookforDogs
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following contents (replace with your values):
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
   JWT_SECRET="your-secret-key"
   PORT=5000
   NODE_ENV=development
   ```

4. Generate Prisma client:
   ```
   npm run prisma:generate
   ```

5. Run migrations:
   ```
   npm run prisma:migrate
   ```

### Running the Application

#### Development mode:
```
npm run dev
```

#### Production mode:
```
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/me` - Update current user profile

### Posts
- `GET /api/posts` - Get all posts with pagination
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create a new post
- `PATCH /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post

### Comments
- `GET /api/comments/post/:postId` - Get comments for a specific post
- `POST /api/comments` - Create a new comment
- `PATCH /api/comments/:id` - Update a comment
- `DELETE /api/comments/:id` - Delete a comment

### Likes
- `POST /api/likes/post/:postId` - Like or unlike a post
- `POST /api/likes/comment/:commentId` - Like or unlike a comment
- `GET /api/likes/post/:postId` - Get all users who liked a post

### Friends
- `GET /api/friends/requests` - Get all friend requests
- `GET /api/friends` - Get all friends
- `POST /api/friends/requests` - Send a friend request
- `PATCH /api/friends/requests/:requestId` - Respond to a friend request
- `DELETE /api/friends/:userId` - Cancel a friend request or remove a friend

### Messages
- `GET /api/messages` - Get all conversations
- `GET /api/messages/:userId` - Get conversation with a specific user
- `POST /api/messages` - Send a message

### Notifications
- `GET /api/notifications` - Get all notifications
- `PATCH /api/notifications/:notificationId` - Mark a notification as read
- `PATCH /api/notifications/read/all` - Mark all notifications as read

## Database Schema

The application uses the following database models:

- **User**: User accounts with authentication info
- **Post**: User-created content
- **Comment**: Comments on posts
- **Like**: Likes on posts and comments
- **FriendRequest**: Friend connections between users
- **Message**: Private messages between users
- **Notification**: System notifications for user activity

## License

This project is licensed under the MIT License. 