const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['car', 'bike', 'scooter', 'other'],
    required: true
  },
  make: String, // Honda, Toyota, etc.
  model: String, // City, Camry, etc.
  color: String,
  parkingSlot: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rfidTag: String,
  stickerNumber: String,
  registrationDate: {
    type: Date,
    default: Date.now
  },
  insuranceExpiry: Date,
  pucExpiry: Date,
  documents: [{
    type: String,
    url: String
  }]
}, {
  timestamps: true
});

// Compound index for unique vehicle per society
vehicleSchema.index({ society: 1, vehicleNumber: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
