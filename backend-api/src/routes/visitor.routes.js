const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Get visitor stats
router.get('/stats', visitorController.getStats);

// Verify OTP
router.post('/verify-otp', authorize('super_admin', 'society_admin', 'gatekeeper'), visitorController.verifyOTP);

// Verify QR
router.post('/verify-qr', authorize('super_admin', 'society_admin', 'gatekeeper'), visitorController.verifyQR);

// Create visitor
router.post('/', visitorController.create);

// Get all visitors
router.get('/', visitorController.getAll);

// Check in
router.post('/:id/checkin', authorize('super_admin', 'society_admin', 'gatekeeper'), visitorController.checkIn);

// Check out
router.post('/:id/checkout', authorize('super_admin', 'society_admin', 'gatekeeper'), visitorController.checkOut);

module.exports = router;
