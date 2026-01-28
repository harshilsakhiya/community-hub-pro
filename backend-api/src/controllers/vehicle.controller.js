const { Vehicle } = require('../models');

// Register vehicle
exports.create = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create({
      ...req.body,
      society: req.user.society,
      flat: req.user.flat || req.body.flat,
      owner: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully.',
      data: vehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this number already registered.'
      });
    }
    next(error);
  }
};

// Get all vehicles
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, flatId } = req.query;
    const societyId = req.user.society;

    const query = { society: societyId };
    if (type) query.vehicleType = type;
    if (flatId) query.flat = flatId;

    // Residents see only their vehicles
    if (req.user.role === 'resident') {
      query.flat = req.user.flat;
    }

    const vehicles = await Vehicle.find(query)
      .populate('flat', 'flatNumber block')
      .populate('owner', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments(query);

    res.json({
      success: true,
      data: vehicles,
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

// Get vehicle by number (for gatekeeper)
exports.getByNumber = async (req, res, next) => {
  try {
    const { vehicleNumber } = req.params;
    const societyId = req.user.society;

    const vehicle = await Vehicle.findOne({
      society: societyId,
      vehicleNumber: vehicleNumber.toUpperCase()
    })
      .populate('flat', 'flatNumber block')
      .populate('owner', 'firstName lastName phone');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not registered in this society.',
        isRegistered: false
      });
    }

    res.json({
      success: true,
      data: vehicle,
      isRegistered: true
    });
  } catch (error) {
    next(error);
  }
};

// Update vehicle
exports.update = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully.',
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

// Delete vehicle
exports.delete = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Assign parking slot
exports.assignParking = async (req, res, next) => {
  try {
    const { parkingSlot } = req.body;

    // Check if slot is already assigned
    const existingVehicle = await Vehicle.findOne({
      society: req.user.society,
      parkingSlot,
      _id: { $ne: req.params.id }
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Parking slot already assigned to another vehicle.'
      });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { parkingSlot },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Parking slot assigned.',
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

// Get vehicle stats
exports.getStats = async (req, res, next) => {
  try {
    const societyId = req.user.society;

    const stats = await Vehicle.aggregate([
      { $match: { society: societyId } },
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Vehicle.countDocuments({ society: societyId });

    res.json({
      success: true,
      data: {
        total,
        byType: stats
      }
    });
  } catch (error) {
    next(error);
  }
};
