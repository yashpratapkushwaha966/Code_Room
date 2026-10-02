const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const { geocodeLocation } = require('../services/geocodeService');
const { cloudinary } = require('../config/cloudinary');

const EARTH_RADIUS_KM = 6378.1;

function haversineKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => v == null)) return null;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Server documents use proper backend field names (bedrooms, securityDeposit,
 * GeoJSON `location`, media objects with Cloudinary publicId). The React UI
 * (already built against client/src/data/properties.js) expects a flatter
 * shape (bhk, deposit, latitude, longitude, plain image URL strings). This
 * function bridges the two so nothing on the frontend needs rewriting.
 */
function toClientProperty(doc, userCoords) {
  const p = doc.toObject ? doc.toObject({ virtuals: false }) : doc;
  const [lng, lat] = (p.location && p.location.coordinates) || [undefined, undefined];
  // Prefer the per-listing contact number (set on "List a property") so a
  // renter always reaches the right number for THIS property, falling back
  // to the owner's account phone for older listings that don't have one.
  const callNumber = p.contactPhone || (p.owner && p.owner.phone);
  const whatsappNumber = p.whatsapp || callNumber;
  const owner =
    p.owner && typeof p.owner === 'object'
      ? {
          id: p.owner._id,
          name: p.owner.name,
          phone: callNumber,
          profileImage: p.owner.profileImage,
          role: 'Property Owner',
          whatsapp: whatsappNumber ? whatsappNumber.replace(/\D/g, '') : undefined,
        }
      : p.owner;

  const distanceKm = userCoords
    ? haversineKm(userCoords.lat, userCoords.lng, lat, lng)
    : undefined;

  return {
    ...p,
    id: p._id,
    bhk: p.bedrooms,
    deposit: p.securityDeposit,
    area: p.locality,
    latitude: lat,
    longitude: lng,
    images: (p.images || []).map((img) => img.url),
    videos: (p.videos || []).map((v) => v.url),
    owner: owner && owner.id ? owner.id : owner,
    ownerInfo: owner && owner.id ? owner : undefined,
    distanceKm: distanceKm != null ? Math.round(distanceKm * 10) / 10 : undefined,
  };
}

/** Accepts either client field names or server field names on the way in. */
function normalizeInput(body) {
  const out = { ...body };

  if (out.bhk !== undefined && out.bedrooms === undefined) out.bedrooms = out.bhk;
  if (out.deposit !== undefined && out.securityDeposit === undefined) out.securityDeposit = out.deposit;
  if (out.area !== undefined && out.locality === undefined) out.locality = out.area;

  if (out.latitude !== undefined && out.longitude !== undefined) {
    out.location = { type: 'Point', coordinates: [Number(out.longitude), Number(out.latitude)] };
  }

  // Accepts either a plain URL string or a { url, publicId } object (the
  // latter is what the upload endpoints actually return — keeping publicId
  // lets deleteProperty later remove the file from Cloudinary too).
  const toMedia = (item) => {
    if (typeof item === 'string') return { url: item, publicId: '', isMain: false };
    if (item && typeof item === 'object' && item.url) {
      return { url: item.url, publicId: item.publicId || '', isMain: false };
    }
    return null;
  };

  if (Array.isArray(out.images)) {
    out.images = out.images.map(toMedia).filter(Boolean);
  }

  // Optional walkthrough video(s) — same shape bridge as images above.
  if (Array.isArray(out.videos)) {
    out.videos = out.videos.map(toMedia).filter(Boolean);
  }

  delete out.bhk;
  delete out.deposit;
  delete out.area;
  delete out.latitude;
  delete out.longitude;

  return out;
}

function parseUserCoords(query) {
  const lat = Number(query.userLat ?? query.latitude);
  const lng = Number(query.userLng ?? query.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return null;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Turns a Mongoose ValidationError into a readable field->message map,
 * and logs it to the terminal so the real cause of a 400 is visible
 * instead of a generic "Validation failed" string.
 */
function explainValidationError(err) {
  if (err && err.name === 'ValidationError' && err.errors) {
    const details = {};
    for (const key of Object.keys(err.errors)) {
      details[key] = err.errors[key].message;
    }
    console.error('Property validation failed:', details);
    return details;
  }
  console.error('Property save failed:', err);
  return null;
}

// @desc    List properties with filters, optional "near me" radius, sorting
// @route   GET /api/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
  const {
    q,
    city,
    propertyType,
    bhk,
    minRent,
    maxRent,
    furnishing,
    amenities,
    radiusKm = 15,
    sort = 'recommended',
    page = 1,
    limit = 20,
  } = req.query;

  const filter = { status: 'active' };

  if (q) {
    const needle = escapeRegex(String(q).trim());
    filter.$or = [
      { title: { $regex: needle, $options: 'i' } },
      { description: { $regex: needle, $options: 'i' } },
      { city: { $regex: needle, $options: 'i' } },
      { locality: { $regex: needle, $options: 'i' } },
    ];
  }
  if (city) filter.city = { $regex: `^${escapeRegex(String(city))}$`, $options: 'i' };
  if (propertyType && propertyType !== 'all') filter.propertyType = propertyType;
  if (furnishing) filter.furnishing = furnishing;
  if (minRent || maxRent) {
    filter.rent = {};
    if (minRent) filter.rent.$gte = Number(minRent);
    if (maxRent) filter.rent.$lte = Number(maxRent);
  }
  if (bhk) {
    filter.bedrooms = Number(bhk) >= 4 ? { $gte: 4 } : Number(bhk);
  }
  if (amenities) {
    const list = Array.isArray(amenities) ? amenities : String(amenities).split(',');
    if (list.length) filter.amenities = { $all: list };
  }

  const userCoords = parseUserCoords(req.query);
  if (userCoords && radiusKm) {
    filter.location = {
      $geoWithin: {
        $centerSphere: [[userCoords.lng, userCoords.lat], Number(radiusKm) / EARTH_RADIUS_KM],
      },
    };
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  let cursor = Property.find(filter).populate('owner', 'name phone profileImage');

  // "nearest" needs every matching doc's real distance computed in JS
  // (via haversineKm below) before it can be sorted, so we page after sorting
  // instead of pushing pagination into the DB query for that one case.
  if (sort !== 'nearest') {
    const sortMap = {
      price_asc: { rent: 1 },
      price_desc: { rent: -1 },
      newest: { createdAt: -1 },
      recommended: { createdAt: -1 },
    };
    cursor = cursor.sort(sortMap[sort] || sortMap.recommended);
    cursor = cursor.skip((pageNum - 1) * limitNum).limit(limitNum);
  }

  const [docs, total] = await Promise.all([cursor, Property.countDocuments(filter)]);

  let results = docs.map((d) => toClientProperty(d, userCoords));

  if (sort === 'nearest') {
    results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    const start = (pageNum - 1) * limitNum;
    results = results.slice(start, start + limitNum);
  }

  res.status(200).json({
    success: true,
    data: results,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Get a single property by id
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'Property not found');

  const property = await Property.findById(id).populate('owner', 'name phone profileImage');
  if (!property) throw new ApiError(404, 'Property not found');

  const isOwner = req.user && String(property.owner._id || property.owner) === String(req.user._id);
  if (!isOwner) {
    Property.updateOne({ _id: id }, { $inc: { viewsCount: 1 } }).catch(() => {});
  }

  res.status(200).json({ success: true, data: toClientProperty(property, parseUserCoords(req.query)) });
});

// @desc    Get the logged-in owner's own properties (any status)
// @route   GET /api/properties/mine
// @access  Private
const getMyProperties = asyncHandler(async (req, res) => {
  const docs = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: docs.map((d) => toClientProperty(d)) });
});

// @desc    Create a property listing
// @route   POST /api/properties
// @access  Private
const createProperty = asyncHandler(async (req, res) => {
  const input = normalizeInput(req.body);

  if (!input.location) {
    const query = [input.address, input.locality, input.city].filter(Boolean).join(', ');
    const geo = await geocodeLocation(query);
    input.location = { type: 'Point', coordinates: [geo.lng, geo.lat] };
  }

  let property;
  try {
    property = await Property.create({ ...input, owner: req.user._id });
  } catch (err) {
    const details = explainValidationError(err);
    throw new ApiError(400, details ? 'Property validation failed' : err.message, details);
  }

  const populated = await property.populate('owner', 'name phone profileImage');

  res.status(201).json({ success: true, message: 'Property listed successfully', data: toClientProperty(populated) });
});

// @desc    Update a property listing (owner or admin only)
// @route   PUT /api/properties/:id
// @access  Private
const updateProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  if (!property) throw new ApiError(404, 'Property not found');

  const isOwner = String(property.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to edit this listing');
  }

  const input = normalizeInput(req.body);
  Object.assign(property, input);

  try {
    await property.save();
  } catch (err) {
    const details = explainValidationError(err);
    throw new ApiError(400, details ? 'Property validation failed' : err.message, details);
  }

  const populated = await property.populate('owner', 'name phone profileImage');

  res.status(200).json({ success: true, message: 'Property updated', data: toClientProperty(populated) });
});

// @desc    Delete a property listing (owner or admin only)
// @route   DELETE /api/properties/:id
// @access  Private
const deleteProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  if (!property) throw new ApiError(404, 'Property not found');

  const isOwner = String(property.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to delete this listing');
  }

  const publicIds = [...property.images, ...property.videos].map((m) => m.publicId).filter(Boolean);
  await Promise.all(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId).catch(() => {}))
  );

  await property.deleteOne();
  res.status(200).json({ success: true, message: 'Property deleted' });
});

module.exports = {
  getProperties,
  getPropertyById,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  toClientProperty,
};