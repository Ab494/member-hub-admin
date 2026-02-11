const express = require('express');
const router = express.Router();
const renewalsController = require('../controllers/renewalsController.cjs');
const { authenticate } = require('../middleware/authMiddleware.cjs');

router.get('/', authenticate, renewalsController.getAll);
router.post('/', authenticate, renewalsController.create);

module.exports = router;
