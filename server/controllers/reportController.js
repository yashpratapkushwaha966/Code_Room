const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');

// @desc    Report a listing (fake, wrong info, already rented, etc.)
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const { property, reason, details } = req.body;

  const exists = await Property.exists({ _id: property });
  if (!exists) throw new ApiError(404, 'Property not found');

  const report = await Report.create({ reporter: req.user._id, property, reason, details });
  res.status(201).json({ success: true, message: 'Report submitted — our team will review it', data: report });
});

// @desc    List reports (optionally filtered by status)
// @route   GET /api/reports
// @access  Private/Admin
const getReports = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const reports = await Report.find(filter)
    .sort({ createdAt: -1 })
    .populate('reporter', 'name email')
    .populate('property', 'title city');

  res.status(200).json({ success: true, data: reports });
});

// @desc    Update a report's status
// @route   PUT /api/reports/:id
// @access  Private/Admin
const updateReportStatus = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found');

  report.status = req.body.status;
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();
  await report.save();

  res.status(200).json({ success: true, message: 'Report updated', data: report });
});

module.exports = { createReport, getReports, updateReportStatus };
