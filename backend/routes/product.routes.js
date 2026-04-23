const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, isStaffOrAdmin } = require('../middleware/auth.middleware');

router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);

// Thêm, sửa, xóa sản phẩm cần quyền Staff hoặc Admin
router.post('/', verifyToken, isStaffOrAdmin, productController.createProduct);
router.put('/:id', verifyToken, isStaffOrAdmin, productController.updateProduct);
router.delete('/:id', verifyToken, isStaffOrAdmin, productController.deleteProduct);

module.exports = router;
