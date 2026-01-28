const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  flat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flat',
    required: true
  },
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  billingMonth: {
    type: Date,
    required: true
  },
  billType: {
    type: String,
    enum: ['maintenance', 'water', 'electricity', 'parking', 'penalty', 'other'],
    default: 'maintenance'
  },
  amount: {
    type: Number,
    required: true
  },
  lateFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'partially_paid', 'cancelled'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paidDate: Date,
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'netbanking', 'cheque', 'razorpay', 'stripe']
  },
  transactionId: String,
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    stripePaymentIntentId: String
  },
  breakdown: [{
    description: String,
    amount: Number
  }],
  notes: String,
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate invoice number
billSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.invoiceNumber = `INV-${year}${month}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);
