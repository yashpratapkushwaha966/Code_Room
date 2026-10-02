// -----------------------------------------------------------------------
// PROPERTY SERVICE
//
// Every page/component talks to properties ONLY through the functions
// below. Reads (getProperties/getPropertyById) call the real Express/
// MongoDB API and fall back to bundled mock data if the API is entirely
// unreachable, so browsing still works offline/first-run.
//
// Writes (addProperty/updateProperty/deleteProperty) do NOT fall back —
// if the API rejects the request (validation error, auth error, etc.)
// the real error is thrown so the UI can show it instead of pretending
// the save/delete succeeded.
// -----------------------------------------------------------------------

import { PROPERTIES } from "../data/properties.js";
import { OWNERS } from "../data/owners.js";
import { distanceKm } from "../utils/distance.js";
import { authHeader } from "./authService.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseJsonOrThrow(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let message = data.message || `Request failed (${res.status})`;
    // Zod validation errors come back as { details: [{ field, message }] } —
    // surface the exact field + reason instead of a generic "Validation failed".
    if (Array.isArray(data.details) && data.details.length) {
      message += ": " + data.details.map((d) => `${d.field ? d.field + " — " : ""}${d.message}`).join("; ");
    }
    throw new Error(message);
  }
  return data;
}

function buildQuery(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") return;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
    } else {
      params.set(key, value);
    }
  });
  return params.toString();
}

// ------------------------------- MOCK FALLBACK (reads only) -------------------------------
const LOCAL_KEY = "rnm_added_properties";
const DELETED_KEY = "rnm_deleted_property_ids";

function readLocalAdditions() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
  } catch {
    return [];
  }
}
function readDeletedIds() {
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY)) || [];
  } catch {
    return [];
  }
}
function allMockProperties() {
  const deleted = new Set(readDeletedIds());
  return [...PROPERTIES, ...readLocalAdditions()].filter((p) => !deleted.has(p.id));
}
function withOwner(property) {
  return { ...property, ownerInfo: OWNERS[property.owner] || null };
}

async function mockGetProperties(filters = {}) {
  await delay(200);
  let results = allMockProperties().map(withOwner);
  const {
    q, city, propertyType, bhk, minRent, maxRent, furnishing, amenities,
    userLat, userLng, radiusKm = 15, sort = "recommended",
  } = filters;

  if (q) {
    const needle = q.trim().toLowerCase();
    results = results.filter(
      (p) => p.city.toLowerCase().includes(needle) || p.area.toLowerCase().includes(needle) || p.title.toLowerCase().includes(needle)
    );
  }
  if (city) results = results.filter((p) => p.city.toLowerCase() === city.toLowerCase());
  if (propertyType && propertyType !== "all") results = results.filter((p) => p.propertyType === propertyType);
  if (bhk) results = results.filter((p) => (bhk >= 4 ? p.bhk >= 4 : p.bhk === Number(bhk)));
  if (minRent) results = results.filter((p) => p.rent >= Number(minRent));
  if (maxRent) results = results.filter((p) => p.rent <= Number(maxRent));
  if (furnishing) results = results.filter((p) => p.furnishing === furnishing);
  if (amenities && amenities.length) results = results.filter((p) => amenities.every((a) => p.amenities.includes(a)));

  if (userLat != null && userLng != null) {
    results = results.map((p) => ({ ...p, distanceKm: distanceKm(userLat, userLng, p.latitude, p.longitude) }));
    if (radiusKm) results = results.filter((p) => p.distanceKm == null || p.distanceKm <= radiusKm);
  }

  switch (sort) {
    case "price_asc": results.sort((a, b) => a.rent - b.rent); break;
    case "price_desc": results.sort((a, b) => b.rent - a.rent); break;
    case "nearest": results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)); break;
    case "newest": results.sort((a, b) => new Date(b.availableFrom) - new Date(a.availableFrom)); break;
    default: results.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
  return results;
}

// --------------------------------- REAL API ---------------------------------

/**
 * Fetch a filtered, sorted list of properties.
 * filters: { q, city, propertyType, bhk, minRent, maxRent, furnishing, amenities,
 *            userLat, userLng, radiusKm, sort }
 */
export async function getProperties(filters = {}) {
  try {
    const qs = buildQuery(filters);
    const res = await fetch(`${API_BASE}/properties?${qs}`);
    const data = await parseJsonOrThrow(res);
    return data.data;
  } catch {
    return mockGetProperties(filters);
  }
}

export async function getPropertyById(id) {
  try {
    const res = await fetch(`${API_BASE}/properties/${id}`);
    if (res.status === 404) return null;
    const data = await parseJsonOrThrow(res);
    return data.data;
  } catch {
    const found = allMockProperties().find((p) => p.id === id);
    return found ? withOwner(found) : null;
  }
}

export async function getFeaturedProperties() {
  const props = await getProperties({});
  return props.filter((p) => p.featured);
}

export async function getNearbyProperties(property, limit = 4) {
  const props = await getProperties({ city: property.city });
  return props.filter((p) => p.id !== property.id).slice(0, limit);
}

/**
 * Add a property (owner dashboard). Requires the user to be logged in —
 * the Authorization header carries the JWT from authService.
 *
 * Throws on failure (validation error, auth error, network error) so the
 * form can show the real reason instead of silently "succeeding".
 */
export async function addProperty(data) {
  const res = await fetch(`${API_BASE}/properties`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  const json = await parseJsonOrThrow(res);
  return json.data;
}

export async function updateProperty(id, data) {
  const res = await fetch(`${API_BASE}/properties/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  const json = await parseJsonOrThrow(res);
  return json.data;
}

/** Throws on failure so the dashboard can show a real error in its delete-confirm dialog. */
export async function deleteProperty(id) {
  const res = await fetch(`${API_BASE}/properties/${id}`, { method: "DELETE", headers: authHeader() });
  await parseJsonOrThrow(res);
  return true;
}

/** The logged-in owner's own properties (any status), via /properties/mine. */
export async function getMyProperties() {
  const res = await fetch(`${API_BASE}/properties/mine`, { headers: authHeader() });
  const json = await parseJsonOrThrow(res);
  return json.data;
}

// Kept for backward compatibility with any older call sites; prefer
// getMyProperties() for the logged-in owner's dashboard.
export async function getOwnerProperties(ownerId = "owner-1") {
  try {
    return await getMyProperties();
  } catch {
    const props = await mockGetProperties({});
    const local = readLocalAdditions().map(withOwner);
    const combined = [...props, ...local].filter((p) => p.owner === ownerId);
    const seen = new Set();
    return combined.filter((p) => (seen.has(p.id) ? false : seen.add(p.id)));
  }
}