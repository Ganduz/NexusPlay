const { query } = require('express-validator');

const gameListRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('platform').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sort').optional().isIn(['price:asc', 'price:desc', 'name:asc', 'name:desc', 'release:desc', 'release:asc', 'discount:desc']),
];

const searchRules = [
  query('q').notEmpty().withMessage('Search query is required').isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

module.exports = { gameListRules, searchRules };
