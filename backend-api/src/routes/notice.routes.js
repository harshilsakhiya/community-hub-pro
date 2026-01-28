const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/notice.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Create notice
router.post('/', authorize('super_admin', 'society_admin', 'committee_member'), noticeController.create);

// Get all notices
router.get('/', noticeController.getAll);

// Get notice by ID
router.get('/:id', noticeController.getById);

// Update notice
router.put('/:id', authorize('super_admin', 'society_admin', 'committee_member'), noticeController.update);

// Delete notice
router.delete('/:id', authorize('super_admin', 'society_admin', 'committee_member'), noticeController.delete);

// Toggle pin
router.post('/:id/toggle-pin', authorize('super_admin', 'society_admin', 'committee_member'), noticeController.togglePin);

module.exports = router;
