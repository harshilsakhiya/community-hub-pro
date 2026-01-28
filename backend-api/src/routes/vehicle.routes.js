const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Get vehicle stats
router.get('/stats', authorize('super_admin', 'society_admin', 'gatekeeper'), vehicleController.getStats);

// Check vehicle by number (gatekeeper)
router.get('/check/:vehicleNumber', authorize('super_admin', 'society_admin', 'gatekeeper'), vehicleController.getByNumber);

// Create vehicle
router.post('/', vehicleController.create);

// Get all vehicles
router.get('/', vehicleController.getAll);

// Update vehicle
router.put('/:id', vehicleController.update);

// Delete vehicle
router.delete('/:id', vehicleController.delete);

// Assign parking
router.put('/:id/parking', authorize('super_admin', 'society_admin'), vehicleController.assignParking);

module.exports = router;
