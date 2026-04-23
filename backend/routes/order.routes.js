const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, isStaffOrAdmin } = require('../middleware/auth.middleware');

router.get('/', verifyToken, orderController.getAllOrders);
router.post('/', verifyToken, orderController.createOrder); // Ai đăng nhập cũng tạo đơn được
router.put('/:id/approve', verifyToken, isStaffOrAdmin, orderController.updateOrderStatus); 

module.exports = router;
