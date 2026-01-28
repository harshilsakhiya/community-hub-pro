const { Bill, Complaint, Visitor, Flat, User, Vehicle } = require('../models');

// Get dashboard stats
exports.getStats = async (req, res, next) => {
  try {
    const societyId = req.user.society;
    const userRole = req.user.role;

    const stats = {};

    // Common stats for admin/committee
    if (['super_admin', 'society_admin', 'committee_member'].includes(userRole)) {
      // Flat stats
      const totalFlats = await Flat.countDocuments({ society: societyId });
      const occupiedFlats = await Flat.countDocuments({ society: societyId, isOccupied: true });

      // Resident stats
      const totalResidents = await User.countDocuments({ society: societyId, role: 'resident' });

      // Bill stats
      const pendingBills = await Bill.countDocuments({ society: societyId, status: 'pending' });
      const overdueBills = await Bill.countDocuments({ society: societyId, status: 'overdue' });
      
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const monthlyCollection = await Bill.aggregate([
        {
          $match: {
            society: societyId,
            status: 'paid',
            paidDate: { $gte: currentMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ]);

      // Complaint stats
      const openComplaints = await Complaint.countDocuments({
        society: societyId,
        status: { $in: ['open', 'in_progress'] }
      });

      // Today's visitors
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayVisitors = await Visitor.countDocuments({
        society: societyId,
        createdAt: { $gte: today }
      });

      stats.admin = {
        totalFlats,
        occupiedFlats,
        vacantFlats: totalFlats - occupiedFlats,
        totalResidents,
        pendingBills,
        overdueBills,
        monthlyCollection: monthlyCollection[0]?.total || 0,
        openComplaints,
        todayVisitors
      };
    }

    // Gatekeeper stats
    if (['super_admin', 'society_admin', 'gatekeeper'].includes(userRole)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCheckins = await Visitor.countDocuments({
        society: societyId,
        checkInTime: { $gte: today }
      });

      const currentlyInside = await Visitor.countDocuments({
        society: societyId,
        checkInTime: { $ne: null },
        checkOutTime: null
      });

      const pendingVisitors = await Visitor.countDocuments({
        society: societyId,
        preApproved: true,
        checkInTime: null
      });

      const totalVehicles = await Vehicle.countDocuments({ society: societyId });

      stats.gatekeeper = {
        todayCheckins,
        currentlyInside,
        pendingVisitors,
        totalVehicles
      };
    }

    // Resident stats
    if (userRole === 'resident' && req.user.flat) {
      const pendingBills = await Bill.find({
        flat: req.user.flat,
        status: { $in: ['pending', 'overdue'] }
      }).sort({ dueDate: 1 }).limit(5);

      const totalPending = pendingBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

      const myComplaints = await Complaint.countDocuments({
        submittedBy: req.user._id,
        status: { $in: ['open', 'in_progress'] }
      });

      const myVehicles = await Vehicle.countDocuments({ flat: req.user.flat });

      stats.resident = {
        pendingBills: pendingBills.length,
        totalPendingAmount: totalPending,
        openComplaints: myComplaints,
        registeredVehicles: myVehicles
      };
    }

    res.json({
      success: true,
      data: {
        role: userRole,
        ...stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get monthly collection chart data
exports.getCollectionChart = async (req, res, next) => {
  try {
    const societyId = req.user.society;
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months) + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const collections = await Bill.aggregate([
      {
        $match: {
          society: societyId,
          status: 'paid',
          paidDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidDate' },
            month: { $month: '$paidDate' }
          },
          total: { $sum: '$paidAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    next(error);
  }
};

// Get recent activity
exports.getRecentActivity = async (req, res, next) => {
  try {
    const societyId = req.user.society;

    const recentComplaints = await Complaint.find({ society: societyId })
      .populate('submittedBy', 'firstName lastName')
      .populate('flat', 'flatNumber block')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentVisitors = await Visitor.find({ society: societyId })
      .populate('flat', 'flatNumber block')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Bill.find({ society: societyId, status: 'paid' })
      .populate('flat', 'flatNumber block')
      .sort({ paidDate: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        complaints: recentComplaints,
        visitors: recentVisitors,
        payments: recentPayments
      }
    });
  } catch (error) {
    next(error);
  }
};
