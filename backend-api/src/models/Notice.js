const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'maintenance', 'event', 'emergency', 'meeting', 'other'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  attachments: [String],
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  targetAudience: {
    type: String,
    enum: ['all', 'owners', 'tenants', 'committee'],
    default: 'all'
  },
  targetBlocks: [String], // Empty means all blocks
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notice', noticeSchema);
