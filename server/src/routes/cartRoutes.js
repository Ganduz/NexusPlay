const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { addToCartRules, mergeCartRules } = require('../validators/cartValidators');

router.get('/', auth, cartController.getCart);
router.post('/', auth, addToCartRules, validate, cartController.addItem);
router.delete('/:itemId', auth, cartController.removeItem);
router.delete('/', auth, cartController.clearCart);
router.post('/merge', auth, mergeCartRules, validate, cartController.mergeCart);

module.exports = router;
