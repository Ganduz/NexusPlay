const cartModel = require('../models/cartModel');
const gamePlatformModel = require('../models/gamePlatformModel');
const rawgService = require('../services/rawgService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const cartController = {
  enrichCartWithImages: async (items) => {
    return Promise.all(
      items.map(async (item) => {
        const rawgData = await rawgService.getGameDetail(item.rawg_id);
        return {
          ...item,
          background_image: rawgData?.background_image || null,
        };
      })
    );
  },

  getCart: asyncHandler(async (req, res) => {
    const items = await cartModel.getCartByUserId(req.user.id);
    const summary = await cartModel.getCartSummary(req.user.id);

    // Enrich with RAWG images
    const enriched = await cartController.enrichCartWithImages(items);

    res.json({
      success: true,
      data: {
        items: enriched,
        summary,
      },
    });
  }),

  addItem: asyncHandler(async (req, res) => {
    const { gamePlatformId, quantity = 1 } = req.body;

    // Verify game platform exists and is available
    const gp = await gamePlatformModel.findById(gamePlatformId);
    if (!gp) throw ApiError.notFound('Game platform not found');
    if (gp.stock_status === 'out_of_stock') throw ApiError.badRequest('This item is out of stock');

    await cartModel.addItem(req.user.id, gamePlatformId, quantity);

    const items = await cartModel.getCartByUserId(req.user.id);
    const summary = await cartModel.getCartSummary(req.user.id);

    // Enrich with RAWG images so covers remain visible
    const enriched = await cartController.enrichCartWithImages(items);

    res.json({
      success: true,
      message: 'Item added to cart',
      data: { items: enriched, summary },
    });
  }),

  removeItem: asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    await cartModel.removeItem(req.user.id, parseInt(itemId));

    const items = await cartModel.getCartByUserId(req.user.id);
    const summary = await cartModel.getCartSummary(req.user.id);

    // Enrich with RAWG images so remaining covers stay visible
    const enriched = await cartController.enrichCartWithImages(items);

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: { items: enriched, summary },
    });
  }),

  clearCart: asyncHandler(async (req, res) => {
    await cartModel.clearCart(req.user.id);
    res.json({
      success: true,
      message: 'Cart cleared',
      data: { items: [], summary: { item_count: 0, subtotal: 0, discount: 0, total: 0 } },
    });
  }),

  mergeCart: asyncHandler(async (req, res) => {
    const { items } = req.body;

    const validItems = [];
    for (const item of items) {
      const gp = await gamePlatformModel.findById(item.game_platform_id);
      if (gp && gp.stock_status !== 'out_of_stock') {
        validItems.push(item);
      }
    }

    const cartItems = await cartModel.mergeCart(req.user.id, validItems);
    const summary = await cartModel.getCartSummary(req.user.id);

    const enriched = await cartController.enrichCartWithImages(cartItems);

    res.json({
      success: true,
      message: 'Cart merged successfully',
      data: { items: enriched, summary },
    });
  }),
};

module.exports = cartController;
