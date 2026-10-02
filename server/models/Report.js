const mongoose = require('mongoose');

const REPORT_REASONS = [
  'fake-listing',
  'wrong-information',
  'already-rented',
  'inappropriate-content',
  'scam-suspicious',
  'other',
];

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    details: { type: String, trim: true, maxlength: 1000, default: '' },
    status: {
      type: String,
      enum: ['open', 'reviewing', 'resolved', 'dismissed'],
      default: 'open',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

reportSchema.statics.REPORT_REASONS = REPORT_REASONS;

module.exports = mongoose.model('Report', reportSchema);
