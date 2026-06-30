const orderModel = require('../models/orderModel');
const orderService = require('../services/orderService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const orderController = {
  create: asyncHandler(async (req, res) => {
    try {
      const order = await orderService.createOrder(req.user.id);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (err) {
      if (err.message === 'Cart is empty') {
        throw ApiError.badRequest('Your cart is empty');
      }
      if (err.message.includes('out of stock')) {
        throw ApiError.badRequest(err.message);
      }
      throw err;
    }
  }),

  getAll: asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const result = await orderModel.findByUserId(req.user.id, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: result,
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const order = await orderModel.findById(parseInt(req.params.id), req.user.id);
    if (!order) throw ApiError.notFound('Order not found');

    res.json({
      success: true,
      data: order,
    });
  }),
};

module.exports = orderController;
