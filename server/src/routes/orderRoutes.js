const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.post('/', auth, orderController.create);
router.get('/', auth, orderController.getAll);
router.get('/:id', auth, orderController.getById);

module.exports = router;
