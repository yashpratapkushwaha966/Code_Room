// -----------------------------------------------------------------------
// GEOCODING SERVICE (OpenCage)
//
// Converts a manually typed address/area into { latitude, longitude }.
// Requires VITE_OPENCAGE_API_KEY in .env — without it, geocodeAddress()
// resolves to the nearest known city centre from data/properties.js so
// manual search still works during development.
// -----------------------------------------------------------------------

import { CITY_CENTRES } from "../data/properties.js";
import { distanceKm } from "../utils/distance.js";

const API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

export async function geocodeAddress(query) {
  if (API_KEY) {
    try {
      const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query
        )}&countrycode=in&key=${API_KEY}`
      );
      const data = await res.json();
      const result = data?.results?.[0];
      if (result) {
        return {
          latitude: result.geometry.lat,
          longitude: result.geometry.lng,
          formatted: result.formatted,
          isMock: false,
        };
      }
    } catch {
      // fall through to the mock lookup below
    }
  }

  const match = Object.keys(CITY_CENTRES).find((city) =>
    query.toLowerCase().includes(city.toLowerCase())
  );
  if (!match) {
    throw new Error(
      "Could not determine the location for this address. Please select a city, or pin your location manually."
    );
  }
  return { ...CITY_CENTRES[match], formatted: match, isMock: true };
}

export async function reverseGeocodeCity(latitude, longitude) {
  if (API_KEY) {
    try {
      const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          `${latitude},${longitude}`
        )}&key=${API_KEY}`
      );
      if (!res.ok) throw new Error(`OpenCage request failed (${res.status})`);
      const data = await res.json();
      const components = data?.results?.[0]?.components;
      const city =
        components?.city || components?.town || components?.village || components?.county;
      if (city) return { city };
    } catch {
      // fall through to the nearest known city below
    }
  }

  let nearestCity;
  let nearestDistance = Infinity;
  for (const [city, centre] of Object.entries(CITY_CENTRES)) {
    const distance = distanceKm(latitude, longitude, centre.latitude, centre.longitude);
    if (distance != null && distance < nearestDistance) {
      nearestCity = city;
      nearestDistance = distance;
    }
  }

  return { city: nearestDistance <= 60 ? nearestCity : undefined };
}