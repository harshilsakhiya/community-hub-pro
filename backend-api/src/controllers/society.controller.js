const { Society, Flat, User } = require('../models');

// Create society
exports.create = async (req, res, next) => {
  try {
    const society = await Society.create({
      ...req.body,
      admin: req.user._id
    });

    // Update user's society
    await User.findByIdAndUpdate(req.user._id, { society: society._id });

    res.status(201).json({
      success: true,
      message: 'Society created successfully.',
      data: society
    });
  } catch (error) {
    next(error);
  }
};

// Get all societies (Super Admin only)
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    const societies = await Society.find(query)
      .populate('admin', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Society.countDocuments(query);

    res.json({
      success: true,
      data: societies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get society by ID
exports.getById = async (req, res, next) => {
  try {
    const society = await Society.findById(req.params.id)
      .populate('admin', 'firstName lastName email phone')
      .populate('committeeMembers', 'firstName lastName email phone')
      .populate('gatekeepers', 'firstName lastName email phone');

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found.'
      });
    }

    res.json({
      success: true,
      data: society
    });
  } catch (error) {
    next(error);
  }
};

// Update society
exports.update = async (req, res, next) => {
  try {
    const society = await Society.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found.'
      });
    }

    res.json({
      success: true,
      message: 'Society updated successfully.',
      data: society
    });
  } catch (error) {
    next(error);
  }
};

// Add blocks to society
exports.addBlock = async (req, res, next) => {
  try {
    const { name, floors, flatsPerFloor } = req.body;

    const society = await Society.findById(req.params.id);
    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found.'
      });
    }

    society.blocks.push({ name, floors, flatsPerFloor });
    society.totalBlocks = society.blocks.length;
    await society.save();

    // Auto-create flats for the block
    const flatsToCreate = [];
    for (let floor = 1; floor <= floors; floor++) {
      for (let flatNum = 1; flatNum <= flatsPerFloor; flatNum++) {
        flatsToCreate.push({
          society: society._id,
          block: name,
          floor,
          flatNumber: `${floor}${String(flatNum).padStart(2, '0')}`,
          monthlyMaintenance: society.maintenanceAmount
        });
      }
    }

    await Flat.insertMany(flatsToCreate);

    society.totalFlats = await Flat.countDocuments({ society: society._id });
    await society.save();

    res.json({
      success: true,
      message: 'Block added and flats created successfully.',
      data: society
    });
  } catch (error) {
    next(error);
  }
};

// Add amenity
exports.addAmenity = async (req, res, next) => {
  try {
    const society = await Society.findByIdAndUpdate(
      req.params.id,
      { $push: { amenities: req.body } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Amenity added successfully.',
      data: society
    });
  } catch (error) {
    next(error);
  }
};

// Add committee member
exports.addCommitteeMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(userId, { role: 'committee_member' });

    const society = await Society.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { committeeMembers: userId } },
      { new: true }
    ).populate('committeeMembers', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Committee member added successfully.',
      data: society
    });
  } catch (error) {
    next(error);
  }
};

// Add gatekeeper
exports.addGatekeeper = async (req, res, next) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(userId, { role: 'gatekeeper' });

    const society = await Society.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { gatekeepers: userId } },
      { new: true }
    ).populate('gatekeepers', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Gatekeeper added successfully.',
      data: society
    });
  } catch (error) {
    next(error);
  }
};

// Get society stats
exports.getStats = async (req, res, next) => {
  try {
    const societyId = req.params.id || req.user.society;

    const totalFlats = await Flat.countDocuments({ society: societyId });
    const occupiedFlats = await Flat.countDocuments({ society: societyId, isOccupied: true });
    const totalResidents = await User.countDocuments({ society: societyId, role: 'resident' });

    res.json({
      success: true,
      data: {
        totalFlats,
        occupiedFlats,
        vacantFlats: totalFlats - occupiedFlats,
        totalResidents,
        occupancyRate: totalFlats > 0 ? ((occupiedFlats / totalFlats) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};
