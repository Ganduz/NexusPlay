const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerRules, loginRules, refreshRules } = require('../validators/authValidators');

router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.post('/refresh', refreshRules, validate, passport.authenticate('jwt-refresh', { session: false }), authController.refresh);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.me);

module.exports = router;
