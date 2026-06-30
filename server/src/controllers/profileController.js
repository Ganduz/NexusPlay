const userModel = require('../models/userModel');
const reviewModel = require('../models/reviewModel');
const orderModel = require('../models/orderModel');
const rawgService = require('../services/rawgService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const profileController = {
  getProfile: asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.user.id);
    if (!user) throw ApiError.notFound('User not found');

    res.json({
      success: true,
      data: user,
    });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const { username, bio } = req.body;

    if (username) {
      const existing = await userModel.findByUsername(username);
      if (existing && existing.id !== req.user.id) {
        throw ApiError.conflict('Username already taken');
      }
    }

    const user = await userModel.updateProfile(req.user.id, { username, bio });

    res.json({
      success: true,
      message: 'Profile updated',
      data: user,
    });
  }),

  updateAvatar: asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file uploaded');

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await userModel.updateAvatar(req.user.id, avatarUrl);

    res.json({
      success: true,
      message: 'Avatar updated',
      data: user,
    });
  }),

  getDashboard: asyncHandler(async (req, res) => {
    const stats = await userModel.getDashboardStats(req.user.id);

    res.json({
      success: true,
      data: stats,
    });
  }),

  getLibrary: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await orderModel.getUserLibrary(req.user.id, parseInt(page), parseInt(limit));

    // Enrich with RAWG images
    const enrichedItems = await Promise.all(
      (result.items || []).map(async (item) => {
        const rawgData = await rawgService.getGameDetail(item.rawg_id);
        return { ...item, background_image: rawgData?.background_image || null };
      })
    );

    res.json({
      success: true,
      data: { ...result, items: enrichedItems },
    });
  }),

  getMyReviews: asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const result = await reviewModel.findByUserId(req.user.id, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: result,
    });
  }),
};

module.exports = profileController;
