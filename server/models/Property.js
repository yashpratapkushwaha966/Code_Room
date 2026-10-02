const mongoose = require('mongoose');

// Kept in sync with client/src/data/properties.js (PROPERTY_TYPES / AMENITIES_LIST)
// so the API speaks the exact same vocabulary the UI already renders —
// no relabeling/mapping needed between frontend and backend.
const PROPERTY_TYPES = ['Apartment', 'Independent House', 'PG/Room', 'Studio'];

const AMENITIES = [
  'WiFi',
  'Parking',
  'Balcony',
  'Security',
  'Garden',
  'Food',
  'Laundry',
  'Lift',
  'Power Backup',
];

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    isMain: { type: Boolean, default: false },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    propertyType: { type: String, enum: PROPERTY_TYPES, required: true },
    listingType: { type: String, enum: ['rent', 'pg', 'shared'], default: 'rent' },

    rent: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, default: 0, min: 0 },
    maintenance: { type: Number, default: 0, min: 0 },
    availableFrom: { type: Date, default: Date.now },

    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    furnishing: {
      type: String,
      enum: ['Unfurnished', 'Semi Furnished', 'Fully Furnished'],
      default: 'Unfurnished',
    },
    floor: { type: Number, default: null },
    totalFloors: { type: Number, default: null },
    area: { type: Number, default: null }, // sq ft

    amenities: [{ type: String, enum: AMENITIES }],

    address: { type: String, required: true, trim: true },
    locality: { type: String, trim: true, index: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },

    // GeoJSON point for geospatial queries: [longitude, latitude]
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        validate: {
          validator: (coords) =>
            Array.isArray(coords) &&
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90,
          message: 'Invalid coordinates',
        },
      },
    },

    images: [mediaSchema],
    videos: [mediaSchema],

    contactPhone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    preferences: { type: String, trim: true, default: '' }, // e.g. gender preference, students only

    status: {
      type: String,
      enum: ['pending', 'active', 'paused', 'rented', 'rejected'],
      default: 'active',
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified'],
      default: 'unverified',
    },

    viewsCount: { type: Number, default: 0 },
    favoritesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Geospatial index — required for $near / $geoNear queries
propertySchema.index({ location: '2dsphere' });

// Common filter/sort indexes
propertySchema.index({ city: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ rent: 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ title: 'text', description: 'text', locality: 'text', city: 'text' });

propertySchema.statics.PROPERTY_TYPES = PROPERTY_TYPES;
propertySchema.statics.AMENITIES = AMENITIES;

module.exports = mongoose.model('Property', propertySchema);