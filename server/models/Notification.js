const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'new-message',
  'favorite-activity',
  'listing-approved',
  'listing-rejected',
  'listing-expiring',
  'report-status',
  'account-activity',
];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    relatedProperty: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

notificationSchema.statics.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

module.exports = mongoose.model('Notification', notificationSchema);
