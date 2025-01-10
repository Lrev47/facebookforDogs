// src/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  try {
    // Example: Bearer Token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user payload to req
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
