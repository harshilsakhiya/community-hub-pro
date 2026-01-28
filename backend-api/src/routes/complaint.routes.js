const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Get complaint stats
router.get('/stats', authorize('super_admin', 'society_admin', 'committee_member'), complaintController.getStats);

// Create complaint
router.post('/', complaintController.create);

// Get all complaints
router.get('/', complaintController.getAll);

// Get complaint by ID
router.get('/:id', complaintController.getById);

// Update status
router.put('/:id/status', authorize('super_admin', 'society_admin', 'committee_member'), complaintController.updateStatus);

// Assign complaint
router.put('/:id/assign', authorize('super_admin', 'society_admin', 'committee_member'), complaintController.assign);

// Add comment
router.post('/:id/comments', complaintController.addComment);

module.exports = router;
