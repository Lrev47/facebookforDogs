// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET all users
router.get('/', userController.getAllUsers);

// GET user by id
router.get('/:id', userController.getUserById);

// ... Additional user routes (e.g., update, delete, etc.) ...

module.exports = router;
