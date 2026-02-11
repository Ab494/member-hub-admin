const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController.cjs');
const { authenticate } = require('../middleware/authMiddleware.cjs');

router.get('/stats', authenticate, dashboardController.getStats);

module.exports = router;
