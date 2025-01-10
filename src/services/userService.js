// src/services/userService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllUsers = async () => {
  return await prisma.user.findMany();
};

exports.getUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
};

// ... Additional service methods (e.g., createUser, updateUser, deleteUser, etc.) ...
