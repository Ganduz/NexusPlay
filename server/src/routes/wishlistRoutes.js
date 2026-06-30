const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const auth = require('../middleware/auth');

router.get('/', auth, wishlistController.getWishlist);
router.post('/:gameId', auth, wishlistController.toggle);
router.get('/check/:gameId', auth, wishlistController.check);

module.exports = router;
