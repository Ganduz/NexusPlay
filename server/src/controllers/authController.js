const userModel = require('../models/userModel');
const authService = require('../services/authService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authController = {
  register: asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    const existingEmail = await userModel.findByEmail(email);
    if (existingEmail) throw ApiError.conflict('Email already registered');

    const existingUsername = await userModel.findByUsername(username);
    if (existingUsername) throw ApiError.conflict('Username already taken');

    const password_hash = await authService.hashPassword(password);
    const user = await userModel.create({ email, username, password_hash });

    const tokens = authService.generateTokenPair(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar_url: user.avatar_url,
          role: user.role,
        },
        ...tokens,
      },
    });
  }),

  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    if (!user.password_hash) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await authService.comparePassword(password, user.password_hash);
    if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

    const tokens = authService.generateTokenPair(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar_url: user.avatar_url,
          role: user.role,
        },
        ...tokens,
      },
    });
  }),

  refresh: asyncHandler(async (req, res) => {
    const tokenData = req.user;
    if (!tokenData) throw ApiError.unauthorized('Invalid or expired refresh token');

    const tokens = authService.generateTokenPair(tokenData);

    res.json({
      success: true,
      data: tokens,
    });
  }),

  logout: asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  me: asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.user.id);
    if (!user) throw ApiError.notFound('User not found');

    res.json({
      success: true,
      data: { user },
    });
  }),
};

module.exports = authController;
