const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Get all residents
router.get('/', authorize('super_admin', 'society_admin', 'committee_member'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const societyId = req.user.society;

    const query = { society: societyId };
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const residents = await User.find(query)
      .select('-password')
      .populate('flat', 'flatNumber block')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: residents,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    next(error);
  }
});

// Get resident by ID
router.get('/:id', async (req, res, next) => {
  try {
    const resident = await User.findById(req.params.id)
      .select('-password')
      .populate('flat', 'flatNumber block floor');

    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found.' });
    }

    res.json({ success: true, data: resident });
  } catch (error) {
    next(error);
  }
});

// Update resident role
router.put('/:id/role', authorize('super_admin', 'society_admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const resident = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Role updated.', data: resident });
  } catch (error) {
    next(error);
  }
});

// Deactivate resident
router.put('/:id/deactivate', authorize('super_admin', 'society_admin'), async (req, res, next) => {
  try {
    const resident = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Resident deactivated.', data: resident });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
