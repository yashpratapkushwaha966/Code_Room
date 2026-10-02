# Rent Near Me

A location-based MERN rental discovery platform. Users can search for nearby rooms/properties
by GPS or manual location, list their own properties, upload images/videos, favorite listings,
and manage everything from a single account.

## Monorepo layout

```
rent-near-me/
├── client/    React (Vite) frontend
├── server/    Express + MongoDB backend
```

## Build status (phased delivery)

This project is being built in phases, per the original spec:

- [x] Phase 1 — Project setup
- [x] Phase 2 — Database + backend skeleton
- [x] Phase 3 — Authentication
- [ ] Phase 4 — Property CRUD
- [ ] Phase 5 — Location/GPS search
- [ ] Phase 6 — Cloudinary media uploads
- [ ] Phase 7 — Search + filters
- [ ] Phase 8 — Property detail page
- [ ] Phase 9 — Favorites
- [ ] Phase 10 — Dashboard
- [ ] Phase 11 — Reels/video feed
- [ ] Phase 12 — Map integration
- [ ] Phase 13 — Admin panel
- [ ] Phase 14 — Notifications
- [ ] Phase 15 — Security + validation hardening
- [ ] Phase 16 — Performance optimization
- [ ] Phase 17 — Responsive/mobile polish
- [ ] Phase 18 — Production deployment prep

## Quick start (run locally — this sandbox has no internet access)

### 1. Backend

```bash
cd server
cp .env.example .env
# fill in MONGODB_URI, JWT_SECRET, CLOUDINARY_* in .env
npm install
npm run dev
```

The API starts on `http://localhost:5000` by default.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

The app starts on `http://localhost:5173` by default and proxies `/api` requests to the backend.

## Environment variables

See `server/.env.example` for the full list. You will need:

- A **MongoDB Atlas** cluster connection string (with a 2dsphere index enabled for geospatial queries)
- A **Cloudinary** account (cloud name, API key, API secret) for image/video uploads
- A **JWT secret** (any long random string) for signing auth tokens
- Optionally a geocoding API key (e.g. OpenCage, Mapbox, or Google Geocoding) for manual
  location → coordinates conversion — see `server/services/geocodeService.js`
