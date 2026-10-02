const { z } = require('zod');
const Property = require('../../models/Property');

// Property.PROPERTY_TYPES / AMENITIES are the single source of truth (see models/Property.js) —
// kept in sync with the exact labels the React UI already uses (data/properties.js on the client),
// so no relabeling is needed on either side of the API.
const propertyTypeEnum = z.enum(Property.PROPERTY_TYPES);
const amenityEnum = z.enum(Property.AMENITIES);
const furnishingEnum = z.enum(['Unfurnished', 'Semi Furnished', 'Fully Furnished']);

// latitude/longitude are optional at the schema level — if omitted, the
// controller geocodes `address, city` on the server via geocodeService.
const baseShape = {
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(3000),
  propertyType: propertyTypeEnum,
  rent: z.coerce.number().min(0),
  deposit: z.coerce.number().min(0).optional(),
  securityDeposit: z.coerce.number().min(0).optional(),
  bhk: z.coerce.number().min(0).max(10).optional(),
  bedrooms: z.coerce.number().min(0).max(10).optional(),
  bathrooms: z.coerce.number().min(0).max(10).optional(),
  furnishing: furnishingEnum.optional(),
  amenities: z.array(amenityEnum).optional().default([]),
  address: z.string().trim().min(3),
  area: z.string().trim().optional(),
  locality: z.string().trim().optional(),
  // City is optional — owners can skip it; geocoding still works off address/area.
  city: z.string().trim().min(2).optional(),
  state: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  // Accepts either a plain URL string or a { url, publicId } object —
  // the upload endpoints return the latter so Cloudinary cleanup works later.
  images: z
    .array(z.union([z.string(), z.object({ url: z.string(), publicId: z.string().optional() })]))
    .min(1, 'At least one photo is required'),
  videos: z
    .array(z.union([z.string(), z.object({ url: z.string(), publicId: z.string().optional() })]))
    .optional()
    .default([]),
  contactPhone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  availableFrom: z.coerce.date().optional(),
};

const createPropertySchema = z.object(baseShape);

const updatePropertySchema = z.object(
  Object.fromEntries(Object.entries(baseShape).map(([k, v]) => [k, v.optional ? v.optional() : v]))
);

module.exports = { createPropertySchema, updatePropertySchema };