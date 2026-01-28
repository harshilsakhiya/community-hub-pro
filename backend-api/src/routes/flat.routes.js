const express = require('express');
const router = express.Router();
const { Flat, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Get all flats
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, block, occupied } = req.query;
    const societyId = req.user.society;

    const query = { society: societyId };
    if (block) query.block = block;
    if (occupied !== undefined) query.isOccupied = occupied === 'true';

    const flats = await Flat.find(query)
      .populate('owner', 'firstName lastName phone')
      .populate('currentResident', 'firstName lastName phone')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ block: 1, floor: 1, flatNumber: 1 });

    const total = await Flat.countDocuments(query);

    res.json({
      success: true,
      data: flats,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    next(error);
  }
});

// Get flat by ID
router.get('/:id', async (req, res, next) => {
  try {
    const flat = await Flat.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone')
      .populate('currentResident', 'firstName lastName email phone');

    if (!flat) {
      return res.status(404).json({ success: false, message: 'Flat not found.' });
    }

    res.json({ success: true, data: flat });
  } catch (error) {
    next(error);
  }
});

// Update flat
router.put('/:id', authorize('super_admin', 'society_admin'), async (req, res, next) => {
  try {
    const flat = await Flat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Flat updated.', data: flat });
  } catch (error) {
    next(error);
  }
});

// Assign resident to flat
router.post('/:id/assign-resident', authorize('super_admin', 'society_admin'), async (req, res, next) => {
  try {
    const { userId, occupancyType } = req.body;

    const flat = await Flat.findByIdAndUpdate(
      req.params.id,
      {
        currentResident: userId,
        owner: occupancyType === 'owner' ? userId : undefined,
        occupancyType,
        isOccupied: true,
        moveInDate: new Date()
      },
      { new: true }
    );

    // Update user's flat reference
    await User.findByIdAndUpdate(userId, { flat: flat._id, society: flat.society });

    res.json({ success: true, message: 'Resident assigned.', data: flat });
  } catch (error) {
    next(error);
  }
});

// Add family member
router.post('/:id/family', async (req, res, next) => {
  try {
    const flat = await Flat.findByIdAndUpdate(
      req.params.id,
      { $push: { familyMembers: req.body } },
      { new: true }
    );
    res.json({ success: true, message: 'Family member added.', data: flat });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
