const { body } = require('express-validator');

const addToCartRules = [
  body('gamePlatformId')
    .isInt({ min: 1 }).withMessage('Valid game platform ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Quantity must be 1-10'),
];

const mergeCartRules = [
  body('items')
    .isArray({ min: 1 }).withMessage('Items array is required'),
  body('items.*.game_platform_id')
    .isInt({ min: 1 }).withMessage('Valid game platform ID is required'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1, max: 10 }),
];

module.exports = { addToCartRules, mergeCartRules };
