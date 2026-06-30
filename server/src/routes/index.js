const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const gameRoutes = require('./gameRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const reviewRoutes = require('./reviewRoutes');
const profileRoutes = require('./profileRoutes');

router.use('/auth', authRoutes);
router.use('/games', gameRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/', reviewRoutes);
router.use('/profile', profileRoutes);

module.exports = router;
