const express = require('express');
const router = express.Router();
const membersController = require('../controllers/membersController.cjs');
const { authenticate, authorize } = require('../middleware/authMiddleware.cjs');

router.get('/', authenticate, membersController.getAll);
router.get('/status/:search', membersController.getBySearch);
router.get('/:id', authenticate, membersController.getById);
router.post('/', authenticate, authorize('ADMIN'), membersController.create);
router.put('/:id', authenticate, authorize('ADMIN'), membersController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), membersController.remove);

module.exports = router;
