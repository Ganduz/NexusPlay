const { body } = require('express-validator');

const registerRules = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('username')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

const refreshRules = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required'),
];

module.exports = { registerRules, loginRules, refreshRules };
