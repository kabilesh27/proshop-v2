import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { createUser, getUserByEmail, getUserById, updateUserById, matchPassword, generateId } from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = {
    userId: generateId(),
    name,
    email,
    password,
    isAdmin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const createdUser = await createUser(user);

  // Generate token and set it in the response
  const token = generateToken(res, createdUser.userId);

  res.status(201).json({
    _id: createdUser.userId,
    name: createdUser.name,
    email: createdUser.email,
    isAdmin: createdUser.isAdmin,
    createdAt: createdUser.createdAt,
    token,
  });
});

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);

  if (user && await matchPassword(password, user.password)) {
    // Generate token and set it in the response
    const token = generateToken(res, user.userId);

    res.json({
      _id: user.userId,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user & clear token
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ message: 'User logged out' });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.userId);

  if (user) {
    res.json({
      _id: user.userId,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.userId);

  if (user) {
    const updatedData = {
      name: req.body.name || user.name,
      email: req.body.email || user.email,
    };
    if (req.body.password) {
      updatedData.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await updateUserById(user.userId, updatedData);

    res.json({
      _id: updatedUser.userId,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  await deleteUserById(req.params.id);
  res.json({ message: 'User removed' });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserByIdController = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);

  if (user) {
    const updatedData = {
      name: req.body.name || user.name,
      email: req.body.email || user.email,
      isAdmin: req.body.isAdmin ?? user.isAdmin,
    };
    const updatedUser = await updateUserById(user.userId, updatedData);

    res.json({
      _id: updatedUser.userId,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserByIdController,
  updateUser,
};
