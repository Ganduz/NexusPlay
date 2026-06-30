const { body, param } = require('express-validator');

const createReviewRules = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
  body('body')
    .optional()
    .isLength({ max: 5000 }).withMessage('Review body must be under 5000 characters'),
];

const updateReviewRules = [
  param('reviewId').isInt({ min: 1 }),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .isLength({ max: 200 }),
  body('body')
    .optional()
    .isLength({ max: 5000 }),
];

const voteRules = [
  param('reviewId').isInt({ min: 1 }),
  body('voteType')
    .isIn(['up', 'down']).withMessage('Vote type must be "up" or "down"'),
];

module.exports = { createReviewRules, updateReviewRules, voteRules };
