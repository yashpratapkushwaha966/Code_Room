const { z } = require('zod');
const Report = require('../../models/Report');

const createReportSchema = z.object({
  property: z.string().min(1, 'property id is required'),
  reason: z.enum(Report.REPORT_REASONS),
  details: z.string().trim().max(1000).optional().default(''),
});

const updateReportStatusSchema = z.object({
  status: z.enum(['open', 'reviewing', 'resolved', 'dismissed']),
});

module.exports = { createReportSchema, updateReportStatusSchema };
