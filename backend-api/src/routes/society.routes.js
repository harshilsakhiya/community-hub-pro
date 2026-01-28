const express = require('express');
const router = express.Router();
const societyController = require('../controllers/society.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Create society (super admin or new society admin)
router.post('/', authorize('super_admin', 'society_admin'), societyController.create);

// Get all societies (super admin only)
router.get('/', authorize('super_admin'), societyController.getAll);

// Get society by ID
router.get('/:id', societyController.getById);

// Update society
router.put('/:id', authorize('super_admin', 'society_admin'), societyController.update);

// Add block
router.post('/:id/blocks', authorize('super_admin', 'society_admin'), societyController.addBlock);

// Add amenity
router.post('/:id/amenities', authorize('super_admin', 'society_admin'), societyController.addAmenity);

// Add committee member
router.post('/:id/committee', authorize('super_admin', 'society_admin'), societyController.addCommitteeMember);

// Add gatekeeper
router.post('/:id/gatekeepers', authorize('super_admin', 'society_admin'), societyController.addGatekeeper);

// Get stats
router.get('/:id/stats', societyController.getStats);

module.exports = router;
