# RentNearMe — Prototype

A complete React + Vite frontend for a rental listing platform, built with
mock data so it runs immediately, but structured so every data access goes
through a single service layer — swap that layer and the real backend
(Express/MongoDB/Cloudinary/OpenCage) plugs straight in.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

> This sandbox has no network access, so dependencies could not be
> installed or the dev server started here — every file was written and
> syntax/import-checked with esbuild, but please run `npm install && npm run dev`
> on your machine as the final check.

## Connecting your real backend

Everything mock lives behind these files — nothing else in the app talks
to data directly:

- `src/services/propertyService.js` — properties (list/detail/add/delete).
  Set `USE_MOCK = false` at the top and fill in the `fetch()` calls that
  are already stubbed next to each mock branch. Point `VITE_API_BASE_URL`
  (in `.env`, copy from `.env.example`) at your Express server.
- `src/services/weatherService.js` — already calls the real OpenWeatherMap
  API automatically once `VITE_WEATHER_API_KEY` is set in `.env`; falls
  back to labeled mock data otherwise.
- `src/services/geoService.js` — same pattern for OpenCage
  (`VITE_OPENCAGE_API_KEY`).
- `src/hooks/useFavorites.js` — currently localStorage; swap for calls to
  your JWT-protected `/favorites` endpoints, keeping the same
  `{ favorites, isFavorite, toggleFavorite }` return shape.
- Image upload in `src/pages/AddProperty.jsx` currently just previews
  local files — send the selected files to your existing Cloudinary
  upload endpoint first, then pass the returned URLs into `images`.

## Project structure

```
src/
├── components/    Navbar, Hero, SearchBar, WeatherCard, PropertyCard,
│                   PropertyGrid, FilterPanel, SortSelect, OwnerCard,
│                   MapSection, EmptyState, PropertyCardSkeleton, Footer
├── pages/          Home, SearchResults, PropertyDetails, Favorites,
│                   Dashboard, AddProperty
├── data/           properties.js (12 mock listings), owners.js (fictional)
├── services/       propertyService.js, weatherService.js, geoService.js
├── hooks/          useFavorites.js, useGeolocation.js
└── utils/          distance.js, format.js
```

## About the MongoDB duplicate-index warning

No backend files were provided in this session, so I couldn't fix this
directly. The `[MONGOOSE] Warning: Duplicate schema index on {"email":1}`
almost always comes from having **both**:

```js
email: { type: String, unique: true }   // creates an index
```
and, elsewhere in the same schema file,
```js
userSchema.index({ email: 1 });          // creates a second one
```

Open your User model and remove whichever of the two you don't need
(usually keep `unique: true` on the field and delete the separate
`.index({ email: 1 })` call, unless that call also sets other options
like `unique: true, sparse: true` — in that case remove `unique: true`
from the field definition instead). Send me the model file and I'll point
to the exact lines.
