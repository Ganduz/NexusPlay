const wishlistModel = require('../models/wishlistModel');
const gameModel = require('../models/gameModel');
const rawgService = require('../services/rawgService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const wishlistController = {
  getWishlist: asyncHandler(async (req, res) => {
    const items = await wishlistModel.getByUserId(req.user.id);

    // Enrich with RAWG data
    const enriched = await Promise.all(
      items.map(async (item) => {
        const rawgData = await rawgService.getGameDetail(item.rawg_id);
        return {
          ...item,
          background_image: rawgData?.background_image || null,
          rating: rawgData?.rating || null,
          genres: rawgData?.genres || [],
        };
      })
    );

    res.json({
      success: true,  
      data: enriched,
    });
  }),

  toggle: asyncHandler(async (req, res) => {
    const { gameId } = req.params;

    const game = await gameModel.findById(parseInt(gameId));
    if (!game) throw ApiError.notFound('Game not found');

    const result = await wishlistModel.toggle(req.user.id, parseInt(gameId));

    res.json({
      success: true,
      message: result.added ? 'Added to wishlist' : 'Removed from wishlist',
      data: result,
    });
  }),

  check: asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const inWishlist = await wishlistModel.isInWishlist(req.user.id, parseInt(gameId));

    res.json({
      success: true,
      data: { inWishlist },
    });
  }),
};

module.exports = wishlistController;
