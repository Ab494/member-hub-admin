const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.cjs');
const { authenticate } = require('../middleware/authMiddleware.cjs');

router.post('/login', authController.login);
router.post('/register', authenticate, authController.register);
router.post('/refresh', authController.refreshToken);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
