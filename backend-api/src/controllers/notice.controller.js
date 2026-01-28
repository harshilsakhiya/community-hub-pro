const { Notice } = require('../models');

// Create notice
exports.create = async (req, res, next) => {
  try {
    const notice = await Notice.create({
      ...req.body,
      society: req.user.society,
      createdBy: req.user._id
    });

    // TODO: Send push notifications

    res.status(201).json({
      success: true,
      message: 'Notice published successfully.',
      data: notice
    });
  } catch (error) {
    next(error);
  }
};

// Get all notices
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, pinned } = req.query;
    const societyId = req.user.society;

    const query = {
      society: societyId,
      isPublished: true,
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } }
      ]
    };

    if (category) query.category = category;
    if (pinned === 'true') query.isPinned = true;

    const notices = await Notice.find(query)
      .populate('createdBy', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ isPinned: -1, createdAt: -1 });

    const total = await Notice.countDocuments(query);

    res.json({
      success: true,
      data: notices,
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

// Get notice by ID
exports.getById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.'
      });
    }

    // Mark as read
    if (!notice.readBy.find(r => r.user.toString() === req.user._id.toString())) {
      notice.readBy.push({ user: req.user._id });
      await notice.save();
    }

    res.json({
      success: true,
      data: notice
    });
  } catch (error) {
    next(error);
  }
};

// Update notice
exports.update = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.'
      });
    }

    res.json({
      success: true,
      message: 'Notice updated successfully.',
      data: notice
    });
  } catch (error) {
    next(error);
  }
};

// Delete notice
exports.delete = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.'
      });
    }

    res.json({
      success: true,
      message: 'Notice deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Pin/Unpin notice
exports.togglePin = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.'
      });
    }

    notice.isPinned = !notice.isPinned;
    await notice.save();

    res.json({
      success: true,
      message: notice.isPinned ? 'Notice pinned.' : 'Notice unpinned.',
      data: notice
    });
  } catch (error) {
    next(error);
  }
};
