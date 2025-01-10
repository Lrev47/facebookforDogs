// src/middlewares/errorHandler.js

exports.errorHandler = (err, req, res, next) => {
    console.error('[Error] ', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred.';
    return res.status(statusCode).json({ message });
  };
  