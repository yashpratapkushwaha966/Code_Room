/**
 * Seeds the database with one owner, one admin, and a handful of sample
 * properties across the cities already used in the client's mock data —
 * so the real API returns something meaningful the first time the
 * frontend is switched over from mock data. Safe to re-run: it wipes and
 * recreates only what it seeds (Users with these emails + all Properties).
 *
 * Usage:  npm run seed   (reads server/.env, so fill it in first)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Property = require('../models/Property');

const OWNER_EMAIL = 'owner@rentnearme.test';
const ADMIN_EMAIL = 'admin@rentnearme.test';
const SEED_PASSWORD = 'Password123!';

const SAMPLE_PROPERTIES = [
  {
    title: 'Modern 2 BHK Apartment',
    description:
      'A bright, well-ventilated 2 BHK in the heart of City Centre — close to markets, schools and the bus stand.',
    propertyType: 'Apartment',
    bedrooms: 2,
    rent: 15000,
    securityDeposit: 30000,
    furnishing: 'Semi Furnished',
    amenities: ['Parking', 'Balcony', 'WiFi'],
    address: 'Plot 14, City Centre Main Road, Gwalior',
    locality: 'City Centre',
    city: 'Gwalior',
    location: { type: 'Point', coordinates: [78.1828, 26.2183] },
    images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80', publicId: '' }],
  },
  {
    title: 'Cozy PG Room Near Station',
    description: 'Furnished single room, ideal for students and working professionals, walking distance to the station.',
    propertyType: 'PG/Room',
    bedrooms: 1,
    rent: 6000,
    securityDeposit: 6000,
    furnishing: 'Fully Furnished',
    amenities: ['WiFi', 'Food', 'Laundry'],
    address: 'Near Railway Station, Bhopal',
    locality: 'Habibganj',
    city: 'Bhopal',
    location: { type: 'Point', coordinates: [77.4126, 23.2599] },
    images: [{ url: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200&q=80', publicId: '' }],
  },
  {
    title: 'Spacious Independent House',
    description: 'Independent 3 BHK house with a private garden and covered parking for two vehicles.',
    propertyType: 'Independent House',
    bedrooms: 3,
    rent: 22000,
    securityDeposit: 44000,
    furnishing: 'Unfurnished',
    amenities: ['Parking', 'Garden', 'Security'],
    address: 'Vijay Nagar, Indore',
    locality: 'Vijay Nagar',
    city: 'Indore',
    location: { type: 'Point', coordinates: [75.8577, 22.7196] },
    images: [{ url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80', publicId: '' }],
  },
];

async function seed() {
  await connectDB();

  await User.deleteMany({ email: { $in: [OWNER_EMAIL, ADMIN_EMAIL] } });
  const owner = await User.create({
    name: 'Sample Owner',
    email: OWNER_EMAIL,
    password: SEED_PASSWORD,
    role: 'user',
    city: 'Gwalior',
  });
  await User.create({
    name: 'Site Admin',
    email: ADMIN_EMAIL,
    password: SEED_PASSWORD,
    role: 'admin',
  });

  await Property.deleteMany({});
  await Property.insertMany(SAMPLE_PROPERTIES.map((p) => ({ ...p, owner: owner._id, status: 'active' })));

  console.log('Seed complete:');
  console.log(`  Owner login -> ${OWNER_EMAIL} / ${SEED_PASSWORD}`);
  console.log(`  Admin login -> ${ADMIN_EMAIL} / ${SEED_PASSWORD}`);
  console.log(`  ${SAMPLE_PROPERTIES.length} sample properties created`);

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
