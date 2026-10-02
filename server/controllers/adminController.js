const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const { toClientProperty } = require('./propertyController');

// @desc    List all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: users });
});

// @desc    Suspend or unsuspend a user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
const setUserSuspended = asyncHandler(async (req, res) => {
  const { suspended } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.isSuspended = Boolean(suspended);
  await user.save();

  res.status(200).json({ success: true, message: `User ${suspended ? 'suspended' : 'unsuspended'}`, data: user });
});

// @desc    List properties awaiting verification
// @route   GET /api/admin/properties/pending
// @access  Private/Admin
const getPendingProperties = asyncHandler(async (req, res) => {
  const docs = await Property.find({ verificationStatus: 'pending' })
    .sort({ createdAt: -1 })
    .populate('owner', 'name phone profileImage');

  res.status(200).json({ success: true, data: docs.map((d) => toClientProperty(d)) });
});

// @desc    Verify or reject a property listing
// @route   PUT /api/admin/properties/:id/verify
// @access  Private/Admin
const setPropertyVerification = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'verified' | 'unverified'
  if (!['verified', 'unverified', 'pending'].includes(status)) {
    throw new ApiError(400, 'status must be one of: verified, unverified, pending');
  }

  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');

  property.verificationStatus = status;
  await property.save();

  res.status(200).json({ success: true, message: 'Verification status updated', data: toClientProperty(property) });
});

module.exports = { getUsers, setUserSuspended, getPendingProperties, setPropertyVerification };
