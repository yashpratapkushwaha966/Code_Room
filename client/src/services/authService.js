// -----------------------------------------------------------------------
// AUTH SERVICE — talks to the real Express /api/auth endpoints (these were
// already fully implemented on the backend; only the frontend was missing).
// Stores the JWT in localStorage and exposes authHeader() for other
// services (propertyService, favoriteService, uploadService) to attach it.
// -----------------------------------------------------------------------

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const TOKEN_KEY = "rnm_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  let data = {};
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }
  if (!res.ok) throw new Error(data.message || "Something went wrong. Please try again.");
  return data;
}

export async function register({ name, email, phone, password }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
  });
  const data = await handle(res);
  setToken(data.data.token);
  return data.data.user;
}

export async function login({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handle(res);
  setToken(data.data.token);
  return data.data.user;
}

export async function fetchMe() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeader() });
    if (!res.ok) {
      setToken(null);
      return null;
    }
    const data = await res.json();
    return data.data.user;
  } catch {
    // backend unreachable — treat as logged out rather than crashing the app
    return null;
  }
}

export function logout() {
  setToken(null);
}

/** Updates name/phone/bio/city/area/profileImage for the logged-in user. */
export async function updateProfile(payload) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(payload),
  });
  const data = await handle(res);
  return data.data.user;
}

/** Changes the logged-in user's password. */
export async function changePassword({ currentPassword, newPassword }) {
  const res = await fetch(`${API_BASE}/auth/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handle(res);
}