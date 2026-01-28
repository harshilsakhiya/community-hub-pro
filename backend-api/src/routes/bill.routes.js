const express = require('express');
const router = express.Router();
const billController = require('../controllers/bill.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Generate bills (admin only)
router.post('/generate', authorize('super_admin', 'society_admin'), billController.generateBills);

// Apply late fees (admin only)
router.post('/apply-late-fee', authorize('super_admin', 'society_admin'), billController.applyLateFee);

// Get billing summary
router.get('/summary', authorize('super_admin', 'society_admin', 'committee_member'), billController.getSummary);

// Get all bills
router.get('/', billController.getAll);

// Get bill by ID
router.get('/:id', billController.getById);

// Update bill (admin only)
router.put('/:id', authorize('super_admin', 'society_admin'), billController.update);

// Mark as paid (admin only)
router.post('/:id/mark-paid', authorize('super_admin', 'society_admin'), billController.markPaid);

module.exports = router;
