const { Visitor } = require('../models');

// Register visitor (by gatekeeper or pre-approve by resident)
exports.create = async (req, res, next) => {
  try {
    const visitorData = {
      ...req.body,
      society: req.user.society
    };

    // If resident is pre-approving
    if (req.user.role === 'resident') {
      visitorData.flat = req.user.flat;
      visitorData.preApproved = true;
      visitorData.preApprovedBy = req.user._id;
      visitorData.approvalStatus = 'approved';
    } else {
      // Gatekeeper logging
      visitorData.loggedBy = req.user._id;
      visitorData.checkInTime = new Date();
      visitorData.approvalStatus = 'approved';
    }

    const visitor = await Visitor.create(visitorData);

    res.status(201).json({
      success: true,
      message: 'Visitor registered successfully.',
      data: {
        visitor,
        otp: visitor.otp,
        qrCode: visitor.qrCode
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all visitors
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, date, status, type } = req.query;
    const societyId = req.user.society;

    const query = { society: societyId };
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }
    
    if (status === 'inside') {
      query.checkInTime = { $ne: null };
      query.checkOutTime = null;
    }
    if (status === 'pending') {
      query.checkInTime = null;
      query.preApproved = true;
    }
    if (type) query.visitorType = type;

    // Residents see only their flat visitors
    if (req.user.role === 'resident') {
      query.flat = req.user.flat;
    }

    const visitors = await Visitor.find(query)
      .populate('flat', 'flatNumber block')
      .populate('preApprovedBy', 'firstName lastName')
      .populate('loggedBy', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Visitor.countDocuments(query);

    res.json({
      success: true,
      data: visitors,
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

// Verify visitor OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const societyId = req.user.society;

    const visitor = await Visitor.findOne({
      society: societyId,
      otp,
      otpExpiry: { $gt: new Date() },
      checkInTime: null
    }).populate('flat', 'flatNumber block');

    if (!visitor) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.'
      });
    }

    res.json({
      success: true,
      message: 'OTP verified.',
      data: visitor
    });
  } catch (error) {
    next(error);
  }
};

// Verify QR code
exports.verifyQR = async (req, res, next) => {
  try {
    const { qrCode } = req.body;
    const societyId = req.user.society;

    const visitor = await Visitor.findOne({
      society: societyId,
      qrCode,
      checkInTime: null
    }).populate('flat', 'flatNumber block');

    if (!visitor) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code or visitor already checked in.'
      });
    }

    res.json({
      success: true,
      message: 'QR verified.',
      data: visitor
    });
  } catch (error) {
    next(error);
  }
};

// Check in visitor
exports.checkIn = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      {
        checkInTime: new Date(),
        loggedBy: req.user._id
      },
      { new: true }
    );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found.'
      });
    }

    res.json({
      success: true,
      message: 'Visitor checked in.',
      data: visitor
    });
  } catch (error) {
    next(error);
  }
};

// Check out visitor
exports.checkOut = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { checkOutTime: new Date() },
      { new: true }
    );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found.'
      });
    }

    res.json({
      success: true,
      message: 'Visitor checked out.',
      data: visitor
    });
  } catch (error) {
    next(error);
  }
};

// Get visitor stats
exports.getStats = async (req, res, next) => {
  try {
    const societyId = req.user.society;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayVisitors = await Visitor.countDocuments({
      society: societyId,
      createdAt: { $gte: today }
    });

    const currentlyInside = await Visitor.countDocuments({
      society: societyId,
      checkInTime: { $ne: null },
      checkOutTime: null
    });

    const pendingApproval = await Visitor.countDocuments({
      society: societyId,
      preApproved: true,
      checkInTime: null
    });

    res.json({
      success: true,
      data: {
        todayVisitors,
        currentlyInside,
        pendingApproval
      }
    });
  } catch (error) {
    next(error);
  }
};
