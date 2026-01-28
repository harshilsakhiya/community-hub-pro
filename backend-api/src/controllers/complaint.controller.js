const { Complaint } = require('../models');

// Create complaint
exports.create = async (req, res, next) => {
  try {
    const complaint = await Complaint.create({
      ...req.body,
      society: req.user.society,
      flat: req.user.flat,
      submittedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// Get all complaints
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, priority } = req.query;
    const societyId = req.user.society;

    const query = { society: societyId };
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Residents can only see their own complaints
    if (req.user.role === 'resident') {
      query.submittedBy = req.user._id;
    }

    const complaints = await Complaint.find(query)
      .populate('flat', 'flatNumber block')
      .populate('submittedBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Complaint.countDocuments(query);

    res.json({
      success: true,
      data: complaints,
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

// Get complaint by ID
exports.getById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('flat', 'flatNumber block')
      .populate('submittedBy', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName')
      .populate('comments.user', 'firstName lastName');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// Update complaint status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;

    const updateData = { status };
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
      updateData.resolutionNotes = resolutionNotes;
    }
    if (status === 'closed') {
      updateData.closedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    res.json({
      success: true,
      message: 'Complaint status updated.',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// Assign complaint
exports.assign = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status: 'in_progress' },
      { new: true }
    ).populate('assignedTo', 'firstName lastName');

    res.json({
      success: true,
      message: 'Complaint assigned successfully.',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// Add comment
exports.addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user: req.user._id,
            comment
          }
        }
      },
      { new: true }
    ).populate('comments.user', 'firstName lastName');

    res.json({
      success: true,
      message: 'Comment added.',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// Get complaint stats
exports.getStats = async (req, res, next) => {
  try {
    const societyId = req.user.society;

    const stats = await Complaint.aggregate([
      { $match: { society: societyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const byCategory = await Complaint.aggregate([
      { $match: { society: societyId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        byCategory
      }
    });
  } catch (error) {
    next(error);
  }
};
