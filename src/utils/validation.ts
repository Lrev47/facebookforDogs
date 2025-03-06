/**
 * Validation utility functions for API requests
 */

/**
 * Basic email validation
 */
export const validateEmail = (email: string): { value: string; error?: Error } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      value: email,
      error: new Error('Invalid email format')
    };
  }
  return { value: email };
};

/**
 * Basic password validation
 * At least 8 characters, containing at least one uppercase, one lowercase, and one number
 */
export const validatePassword = (password: string): { value: string; error?: Error } => {
  if (password.length < 8) {
    return {
      value: password,
      error: new Error('Password must be at least 8 characters long')
    };
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      value: password,
      error: new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    };
  }
  
  return { value: password };
};

/**
 * Registration validator
 */
export const validateRegistration = (data: any): { value: any; error?: Error } => {
  const { email, password, firstName, lastName } = data;
  
  // Check required fields
  if (!email || !password || !firstName || !lastName) {
    return {
      value: data,
      error: new Error('Email, password, first name, and last name are required')
    };
  }
  
  // Validate email
  const emailResult = validateEmail(email);
  if (emailResult.error) {
    return emailResult;
  }
  
  // Validate password
  const passwordResult = validatePassword(password);
  if (passwordResult.error) {
    return passwordResult;
  }
  
  // Validate names
  if (firstName.trim().length < 2) {
    return {
      value: data,
      error: new Error('First name must be at least 2 characters long')
    };
  }
  
  if (lastName.trim().length < 2) {
    return {
      value: data,
      error: new Error('Last name must be at least 2 characters long')
    };
  }
  
  return { value: data };
};

/**
 * Login validator
 */
export const validateLogin = (data: any): { value: any; error?: Error } => {
  const { email, password } = data;
  
  // Check required fields
  if (!email || !password) {
    return {
      value: data,
      error: new Error('Email and password are required')
    };
  }
  
  // Validate email
  const emailResult = validateEmail(email);
  if (emailResult.error) {
    return emailResult;
  }
  
  return { value: data };
};

/**
 * Post creation validator
 */
export const validateCreatePost = (data: any): { value: any; error?: Error } => {
  const { content } = data;
  
  // Check required fields
  if (!content || content.trim().length === 0) {
    return {
      value: data,
      error: new Error('Post content is required')
    };
  }
  
  // Validate content length
  if (content.length > 5000) {
    return {
      value: data,
      error: new Error('Post content cannot exceed 5000 characters')
    };
  }
  
  return { value: data };
};

/**
 * Comment creation validator
 */
export const validateCreateComment = (data: any): { value: any; error?: Error } => {
  const { content, postId } = data;
  
  // Check required fields
  if (!content || content.trim().length === 0) {
    return {
      value: data,
      error: new Error('Comment content is required')
    };
  }
  
  if (!postId) {
    return {
      value: data,
      error: new Error('Post ID is required')
    };
  }
  
  // Validate content length
  if (content.length > 1000) {
    return {
      value: data,
      error: new Error('Comment content cannot exceed 1000 characters')
    };
  }
  
  return { value: data };
};

/**
 * Message creation validator
 */
export const validateCreateMessage = (data: any): { value: any; error?: Error } => {
  const { content, receiverId } = data;
  
  // Check required fields
  if (!content || content.trim().length === 0) {
    return {
      value: data,
      error: new Error('Message content is required')
    };
  }
  
  if (!receiverId) {
    return {
      value: data,
      error: new Error('Receiver ID is required')
    };
  }
  
  // Validate content length
  if (content.length > 2000) {
    return {
      value: data,
      error: new Error('Message content cannot exceed 2000 characters')
    };
  }
  
  return { value: data };
};

/**
 * Friend request validator
 */
export const validateFriendRequest = (data: any): { value: any; error?: Error } => {
  const { userId } = data;
  
  // Check required fields
  if (!userId) {
    return {
      value: data,
      error: new Error('User ID is required')
    };
  }
  
  return { value: data };
}; 