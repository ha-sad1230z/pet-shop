const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken, isStaffOrAdmin } = require('../middleware/auth.middleware');

router.get('/dashboard', verifyToken, isStaffOrAdmin, reportController.getDashboardStats);

module.exports = router;
