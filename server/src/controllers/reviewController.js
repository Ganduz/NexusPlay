const reviewModel = require('../models/reviewModel');
const gameModel = require('../models/gameModel');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const reviewController = {
  getByGame: asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const game = await gameModel.findBySlug(slug);
    if (!game) throw ApiError.notFound('Game not found');

    const userId = req.user?.id || null;
    const result = await reviewModel.findByGameId(game.id, parseInt(page), parseInt(limit), userId);

    res.json({
      success: true,
      data: result,
    });
  }),

  create: asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { rating, title, body } = req.body;

    const game = await gameModel.findBySlug(slug);
    if (!game) throw ApiError.notFound('Game not found');

    // Check if user already reviewed this game
    const existing = await reviewModel.findUserReviewForGame(req.user.id, game.id);
    if (existing) throw ApiError.conflict('You already reviewed this game');

    const review = await reviewModel.create(req.user.id, game.id, { rating, title, body });

    res.status(201).json({
      success: true,
      message: 'Review created',
      data: review,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { rating, title, body } = req.body;

    const review = await reviewModel.update(parseInt(reviewId), req.user.id, { rating, title, body });
    if (!review) throw ApiError.notFound('Review not found or not authorized');

    res.json({
      success: true,
      message: 'Review updated',
      data: review,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const deleted = await reviewModel.delete(parseInt(reviewId), req.user.id);
    if (!deleted) throw ApiError.notFound('Review not found or not authorized');

    res.json({
      success: true,
      message: 'Review deleted',
    });
  }),

  vote: asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { voteType } = req.body;

    const result = await reviewModel.vote(parseInt(reviewId), req.user.id, voteType);

    res.json({
      success: true,
      data: result,
    });
  }),
};

module.exports = reviewController;
