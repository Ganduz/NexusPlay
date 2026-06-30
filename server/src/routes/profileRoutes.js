const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { updateProfileRules } = require('../validators/profileValidators');

router.get('/', auth, profileController.getProfile);
router.put('/', auth, updateProfileRules, validate, profileController.updateProfile);
router.put('/avatar', auth, upload.single('avatar'), profileController.updateAvatar);
router.get('/dashboard', auth, profileController.getDashboard);
router.get('/library', auth, profileController.getLibrary);
router.get('/reviews', auth, profileController.getMyReviews);

module.exports = router;
