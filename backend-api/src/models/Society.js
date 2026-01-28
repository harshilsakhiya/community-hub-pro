const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  registrationNumber: {
    type: String,
    unique: true
  },
  totalBlocks: {
    type: Number,
    default: 1
  },
  totalFloors: {
    type: Number,
    default: 1
  },
  totalFlats: {
    type: Number,
    default: 0
  },
  maintenanceAmount: {
    type: Number,
    default: 0
  },
  maintenanceDueDay: {
    type: Number,
    default: 10 // Due on 10th of every month
  },
  lateFeePercentage: {
    type: Number,
    default: 2 // 2% late fee
  },
  blocks: [{
    name: String,
    floors: Number,
    flatsPerFloor: Number
  }],
  amenities: [{
    name: String,
    description: String,
    isBookable: { type: Boolean, default: false },
    bookingCharges: { type: Number, default: 0 }
  }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  committeeMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  gatekeepers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  logo: String,
  contactEmail: String,
  contactPhone: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Society', societySchema);
