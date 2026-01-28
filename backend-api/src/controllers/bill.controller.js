const { Bill, Flat, Society } = require('../models');

// Generate bills for all flats
exports.generateBills = async (req, res, next) => {
  try {
    const societyId = req.user.society;
    const { billingMonth, dueDate } = req.body;

    const society = await Society.findById(societyId);
    const flats = await Flat.find({ society: societyId, isOccupied: true });

    // Check for existing bills
    const existingBills = await Bill.find({
      society: societyId,
      billingMonth: new Date(billingMonth)
    });
    const existingFlatIds = existingBills.map(b => b.flat.toString());

    const billsToCreate = [];
    for (const flat of flats) {
      if (existingFlatIds.includes(flat._id.toString())) continue;

      const amount = flat.monthlyMaintenance || society.maintenanceAmount;
      billsToCreate.push({
        society: societyId,
        flat: flat._id,
        resident: flat.currentResident,
        billingMonth: new Date(billingMonth),
        billType: 'maintenance',
        amount,
        totalAmount: amount,
        dueDate: new Date(dueDate),
        generatedBy: req.user._id
      });
    }

    const createdBills = await Bill.insertMany(billsToCreate);

    res.status(201).json({
      success: true,
      message: `Generated ${createdBills.length} bills.`,
      data: {
        generated: createdBills.length,
        skipped: existingBills.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all bills
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, month, flatId } = req.query;
    const societyId = req.user.society;

    const query = { society: societyId };
    if (status) query.status = status;
    if (month) query.billingMonth = new Date(month);
    if (flatId) query.flat = flatId;

    // Residents can only see their own bills
    if (req.user.role === 'resident') {
      query.flat = req.user.flat;
    }

    const bills = await Bill.find(query)
      .populate('flat', 'flatNumber block')
      .populate('resident', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ billingMonth: -1 });

    const total = await Bill.countDocuments(query);

    res.json({
      success: true,
      data: bills,
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

// Get bill by ID
exports.getById = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('flat', 'flatNumber block')
      .populate('resident', 'firstName lastName email phone')
      .populate('society', 'name');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found.'
      });
    }

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    next(error);
  }
};

// Update bill
exports.update = async (req, res, next) => {
  try {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found.'
      });
    }

    res.json({
      success: true,
      message: 'Bill updated successfully.',
      data: bill
    });
  } catch (error) {
    next(error);
  }
};

// Mark as paid (manual)
exports.markPaid = async (req, res, next) => {
  try {
    const { paymentMethod, transactionId, notes } = req.body;

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found.'
      });
    }

    bill.status = 'paid';
    bill.paidAmount = bill.totalAmount;
    bill.paidDate = new Date();
    bill.paymentMethod = paymentMethod;
    bill.transactionId = transactionId;
    bill.notes = notes;
    await bill.save();

    res.json({
      success: true,
      message: 'Bill marked as paid.',
      data: bill
    });
  } catch (error) {
    next(error);
  }
};

// Apply late fee
exports.applyLateFee = async (req, res, next) => {
  try {
    const societyId = req.user.society;
    const society = await Society.findById(societyId);

    const overdueBills = await Bill.find({
      society: societyId,
      status: 'pending',
      dueDate: { $lt: new Date() }
    });

    for (const bill of overdueBills) {
      const lateFee = (bill.amount * society.lateFeePercentage) / 100;
      bill.lateFee = lateFee;
      bill.totalAmount = bill.amount + lateFee - bill.discount;
      bill.status = 'overdue';
      await bill.save();
    }

    res.json({
      success: true,
      message: `Applied late fee to ${overdueBills.length} bills.`,
      data: { updated: overdueBills.length }
    });
  } catch (error) {
    next(error);
  }
};

// Get billing summary
exports.getSummary = async (req, res, next) => {
  try {
    const societyId = req.user.society;
    const { month } = req.query;

    const matchStage = { society: societyId };
    if (month) matchStage.billingMonth = new Date(month);

    const summary = await Bill.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' }
        }
      }
    ]);

    const totalCollection = await Bill.aggregate([
      { $match: { society: societyId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: summary,
        totalCollection: totalCollection[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
