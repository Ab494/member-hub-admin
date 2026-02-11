const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController.cjs');
const { authenticate } = require('../middleware/authMiddleware.cjs');

router.get('/', authenticate, paymentsController.getAll);
router.get('/stats', authenticate, paymentsController.getStats);
router.post('/', authenticate, paymentsController.createPayment);
router.post('/mpesa/callback', paymentsController.mpesaCallback);

module.exports = router;
