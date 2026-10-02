const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const { toClientProperty } = require('./propertyController');

// @desc    List the current user's favorited properties
// @route   GET /api/favorites
// @access  Private
const getMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id }).populate({
    path: 'property',
    populate: { path: 'owner', select: 'name phone profileImage' },
  });

  const properties = favorites.filter((f) => f.property).map((f) => toClientProperty(f.property));
  res.status(200).json({ success: true, data: properties });
});

// @desc    Add a property to favorites
// @route   POST /api/favorites/:propertyId
// @access  Private
const addFavorite = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  if (!mongoose.isValidObjectId(propertyId)) throw new ApiError(404, 'Property not found');

  const property = await Property.findById(propertyId);
  if (!property) throw new ApiError(404, 'Property not found');

  try {
    await Favorite.create({ user: req.user._id, property: propertyId });
    await Property.updateOne({ _id: propertyId }, { $inc: { favoritesCount: 1 } });
  } catch (err) {
    if (err.code !== 11000) throw err; // 11000 = already favorited, treat as a no-op success
  }

  res.status(201).json({ success: true, message: 'Added to favorites' });
});

// @desc    Remove a property from favorites
// @route   DELETE /api/favorites/:propertyId
// @access  Private
const removeFavorite = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const deleted = await Favorite.findOneAndDelete({ user: req.user._id, property: propertyId });

  if (deleted) {
    await Property.updateOne({ _id: propertyId }, { $inc: { favoritesCount: -1 } });
  }

  res.status(200).json({ success: true, message: 'Removed from favorites' });
});

module.exports = { getMyFavorites, addFavorite, removeFavorite };
