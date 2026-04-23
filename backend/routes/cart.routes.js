const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, cartController.getCart);
router.post('/add', verifyToken, cartController.syncCartItem);
router.put('/:productId', verifyToken, cartController.updateCartItem);
router.delete('/:productId', verifyToken, cartController.removeCartItem);

module.exports = router;
