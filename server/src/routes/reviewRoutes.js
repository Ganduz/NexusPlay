const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReviewRules, updateReviewRules, voteRules } = require('../validators/reviewValidators');

// Game-scoped review routes (mounted under /api/games/:slug/reviews in the main router)
router.get('/games/:slug/reviews', reviewController.getByGame);
router.post('/games/:slug/reviews', auth, createReviewRules, validate, reviewController.create);

// Review-specific routes
router.put('/reviews/:reviewId', auth, updateReviewRules, validate, reviewController.update);
router.delete('/reviews/:reviewId', auth, reviewController.delete);
router.post('/reviews/:reviewId/vote', auth, voteRules, validate, reviewController.vote);

module.exports = router;
