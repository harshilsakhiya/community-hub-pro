const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Get dashboard stats
router.get('/stats', dashboardController.getStats);

// Get collection chart
router.get('/collection-chart', dashboardController.getCollectionChart);

// Get recent activity
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
