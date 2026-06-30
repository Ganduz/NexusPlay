const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const validate = require('../middleware/validate');
const { searchLimiter } = require('../middleware/rateLimiter');
const { gameListRules, searchRules } = require('../validators/gameValidators');

router.get('/', gameListRules, validate, gameController.getAll);
router.get('/homepage', gameController.getHomepage);
router.get('/search', searchLimiter, searchRules, validate, gameController.search);
router.get('/genres', gameController.getGenres);
router.get('/:slug', gameController.getBySlug);
router.get('/:slug/screenshots', gameController.getScreenshots);
router.get('/:slug/trailers', gameController.getTrailers);
router.get('/:slug/series', gameController.getSeries);
router.get('/:slug/platforms', gameController.getPlatforms);

module.exports = router;
