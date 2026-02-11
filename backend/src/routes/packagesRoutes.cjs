const express = require('express');
const router = express.Router();
const packagesController = require('../controllers/packagesController.cjs');
const { authenticate, authorize } = require('../middleware/authMiddleware.cjs');

router.get('/', authenticate, packagesController.getAll);
router.get('/:id', authenticate, packagesController.getById);
router.post('/', authenticate, authorize('ADMIN'), packagesController.create);
router.put('/:id', authenticate, authorize('ADMIN'), packagesController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), packagesController.remove);
router.post('/:id/toggle-active', authenticate, authorize('ADMIN'), packagesController.toggleActive);

module.exports = router;
