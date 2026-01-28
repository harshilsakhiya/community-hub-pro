const mongoose = require('mongoose');

const flatSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  block: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  flatNumber: {
    type: String,
    required: true
  },
  flatType: {
    type: String,
    enum: ['1BHK', '2BHK', '3BHK', '4BHK', 'Penthouse', 'Studio', 'Other'],
    default: '2BHK'
  },
  areaSqft: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  currentResident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  occupancyType: {
    type: String,
    enum: ['owner', 'tenant', 'vacant'],
    default: 'vacant'
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  monthlyMaintenance: {
    type: Number,
    default: 0
  },
  familyMembers: [{
    name: String,
    relation: String,
    phone: String,
    email: String,
    dateOfBirth: Date
  }],
  moveInDate: Date,
  moveOutDate: Date,
  parkingSlots: [{
    slotNumber: String,
    vehicleNumber: String,
    vehicleType: { type: String, enum: ['car', 'bike', 'other'] }
  }]
}, {
  timestamps: true
});

// Compound index for unique flat per society
flatSchema.index({ society: 1, block: 1, flatNumber: 1 }, { unique: true });

// Virtual for full flat identifier
flatSchema.virtual('fullFlatNumber').get(function() {
  return `${this.block}-${this.flatNumber}`;
});

module.exports = mongoose.model('Flat', flatSchema);
