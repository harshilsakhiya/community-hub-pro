const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const visitorSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  visitorType: {
    type: String,
    enum: ['guest', 'delivery', 'cab', 'service', 'other'],
    default: 'guest'
  },
  vehicleNumber: String,
  vehicleType: {
    type: String,
    enum: ['car', 'bike', 'auto', 'cab', 'other', 'none'],
    default: 'none'
  },
  photo: String,
  idType: {
    type: String,
    enum: ['aadhaar', 'pan', 'driving_license', 'passport', 'other', 'none'],
    default: 'none'
  },
  idNumber: String,
  otp: String,
  otpExpiry: Date,
  qrCode: String,
  preApproved: {
    type: Boolean,
    default: false
  },
  preApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  checkInTime: Date,
  checkOutTime: Date,
  loggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, {
  timestamps: true
});

// Generate OTP before saving
visitorSchema.pre('save', function(next) {
  if (!this.otp) {
    this.otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  if (!this.qrCode) {
    this.qrCode = uuidv4();
  }
  next();
});

module.exports = mongoose.model('Visitor', visitorSchema);
