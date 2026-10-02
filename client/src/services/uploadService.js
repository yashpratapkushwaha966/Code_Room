// -----------------------------------------------------------------------
// UPLOADS — sends selected files to the real Cloudinary-backed endpoints.
// -----------------------------------------------------------------------
import { authHeader } from "./authService.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function uploadPropertyImages(files) {
  const form = new FormData();
  files.forEach((file) => form.append("images", file));

  const res = await fetch(`${API_BASE}/upload/images`, {
    method: "POST",
    headers: authHeader(), // don't set Content-Type — the browser sets the multipart boundary
    body: form,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Image upload failed");
  }
  const data = await res.json();
  return data.data; // [{ url, publicId }]
}

/** Uploads a single optional walkthrough/reel video to Cloudinary. */
export async function uploadPropertyVideo(file) {
  const form = new FormData();
  form.append("video", file);

  const res = await fetch(`${API_BASE}/upload/video`, {
    method: "POST",
    headers: authHeader(),
    body: form,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Video upload failed");
  }
  const data = await res.json();
  return data.data; // { url, publicId }
}