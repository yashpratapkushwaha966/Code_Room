// -----------------------------------------------------------------------
// FAVORITES — real backend calls for logged-in users. hooks/useFavorites.js
// falls back to localStorage for guests, so favoriting still works before
// the person logs in.
// -----------------------------------------------------------------------
import { authHeader } from "./authService.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function fetchMyFavorites() {
  const res = await fetch(`${API_BASE}/favorites`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to load favorites");
  const data = await res.json();
  return data.data; // array of properties, already in client shape
}

export async function addFavoriteRemote(propertyId) {
  const res = await fetch(`${API_BASE}/favorites/${propertyId}`, {
    method: "POST",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to add favorite");
}

export async function removeFavoriteRemote(propertyId) {
  const res = await fetch(`${API_BASE}/favorites/${propertyId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to remove favorite");
}
