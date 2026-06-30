const { body } = require('express-validator');

const updateProfileRules = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
  body('bio')
    .optional()
    .isLength({ max: 500 }).withMessage('Bio must be under 500 characters'),
];

module.exports = { updateProfileRules };
