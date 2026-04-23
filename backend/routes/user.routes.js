const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isStaffOrAdmin, isAdmin } = require('../middleware/auth.middleware');

router.post('/', verifyToken, isAdmin, userController.createUser);
router.get('/me', verifyToken, userController.getMe);
router.get('/', verifyToken, isStaffOrAdmin, userController.getAllUsers);
router.put('/:id', verifyToken, isStaffOrAdmin, userController.updateUser);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

module.exports = router;