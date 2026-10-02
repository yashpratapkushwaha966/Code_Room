import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Eye, Heart, Camera, Settings, MessageCircle, X, Loader2, CheckCircle2,
} from "lucide-react";
import { getMyProperties, deleteProperty } from "../services/propertyService.js";
import { uploadPropertyImages } from "../services/uploadService.js";
import { changePassword as changePasswordRequest } from "../services/authService.js";
import { useAuth } from "../context/AuthContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Dashboard() {
  const { user, updateProfile } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Profile photo upload
  const fileInputRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  // Edit profile / settings modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("profile"); // "profile" | "password"

  // Success popup (toast)
  const [toast, setToast] = useState("");

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }

  async function load() {
    setLoading(true);
    try {
      setProperties(await getMyProperties());
    } catch {
      setProperties([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function askDelete(id) {
    setDeleteError("");
    setConfirmId(id);
  }

  function cancelDelete() {
    if (deleting) return;
    setConfirmId(null);
    setDeleteError("");
  }

  async function confirmDelete() {
    if (!confirmId) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteProperty(confirmId);
      setConfirmId(null);
      load();
    } catch (err) {
      setDeleteError(err.message || "Could not delete this listing. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setPhotoError("");
    setPhotoUploading(true);
    try {
      const [uploaded] = await uploadPropertyImages([file]);
      await updateProfile({ profileImage: { url: uploaded.url, publicId: uploaded.publicId } });
    } catch (err) {
      setPhotoError(err.message || "Could not update your photo. Please try again.");
    } finally {
      setPhotoUploading(false);
    }
  }

  const confirmProperty = properties.find((p) => p.id === confirmId);

  const postsCount = properties.length;
  const totalViews = properties.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const totalLikes = properties.reduce((sum, p) => sum + (p.favoritesCount || 0), 0);

  const initial = (user?.name || "?").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      {/* ---------- Profile header ---------- */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Avatar + change photo */}
        <div className="relative shrink-0">
          <div className="h-24 w-24 overflow-hidden rounded-full border border-ink/10 bg-ink/5 sm:h-28 sm:w-28">
            {user?.profileImage?.url ? (
              <img src={user.profileImage.url} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-ink/40">
                {initial}
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={photoUploading}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper shadow-md hover:bg-aqua hover:text-paper disabled:opacity-60"
            aria-label="Change profile photo"
          >
            {photoUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </div>

        {/* Name, actions, stats, bio */}
        <div className="w-full flex-1 text-center sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-start">
            <h1 className="font-display text-xl font-bold text-ink">{user?.name}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setModalTab("profile"); setModalOpen(true); }}
                className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink/80 hover:border-ink/30"
              >
                Edit profile
              </button>
              <button
                onClick={() => { setModalTab("password"); setModalOpen(true); }}
                className="rounded-lg border border-ink/15 p-2 text-ink/70 hover:border-ink/30"
                aria-label="Settings"
              >
                <Settings size={16} />
              </button>
              <Link
                to="/messages"
                className="rounded-lg border border-ink/15 p-2 text-ink/70 hover:border-ink/30"
                aria-label="Messages"
              >
                <MessageCircle size={16} />
              </Link>
            </div>
          </div>

          {photoError && <p className="mt-2 text-xs text-red-500">{photoError}</p>}

          <div className="mt-4 flex justify-center gap-6 sm:justify-start">
            <div className="text-center sm:text-left">
              <p className="font-display text-lg font-bold text-ink">{postsCount}</p>
              <p className="text-xs text-ink/50">posts</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="font-display text-lg font-bold text-ink">{totalViews}</p>
              <p className="text-xs text-ink/50">who viewed</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="font-display text-lg font-bold text-ink">{totalLikes}</p>
              <p className="text-xs text-ink/50">likes</p>
            </div>
          </div>

          <p className="mt-3 whitespace-pre-line text-sm text-ink/70">
            {user?.bio || "No bio yet — tap \"Edit profile\" to add one."}
          </p>
          {(user?.city || user?.area) && (
            <p className="mt-1 text-xs text-ink/50">{[user?.area, user?.city].filter(Boolean).join(", ")}</p>
          )}

          <Link
            to="/dashboard/add-property"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-aqua hover:text-paper"
          >
            <Plus size={16} /> List a Property
          </Link>
        </div>
      </div>

      {/* ---------- Posts grid ---------- */}
      <div className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="text-center font-display text-sm font-semibold uppercase tracking-wide text-ink/50 sm:text-left">
          Your posts
        </h2>

        {loading ? (
          <p className="mt-4 text-sm text-ink/50">Loading...</p>
        ) : properties.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="You haven't listed anything yet."
              subtitle="Add your first property to see it here."
              actionLabel="Add Property"
              onAction={() => (window.location.href = "/dashboard/add-property")}
            />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-1 sm:grid-cols-3">
            {properties.map((p) => (
              <div key={p.id} className="group relative aspect-square overflow-hidden bg-ink/5">
                <Link to={`/property/${p.id}`}>
                  <img src={p.images?.[0]} alt={p.title} className="h-full w-full object-cover" />
                </Link>

                {/* Hover overlay: engagement + manage actions, Instagram-style */}
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-ink/0 p-2 opacity-0 transition group-hover:bg-black/60 group-hover:opacity-100">
                  <div className="pointer-events-auto flex justify-end gap-1">
                    <button
                      onClick={() => alert("Editing is stubbed in this prototype — wire it to your PUT /properties/:id endpoint.")}
                      className="rounded-full bg-white/90 p-1.5 text-ink/70 hover:text-ink"
                      aria-label="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => askDelete(p.id)}
                      className="rounded-full bg-white/90 p-1.5 text-red-500/80 hover:text-red-500"
                      aria-label="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm font-semibold text-white">
                    <span className="flex items-center gap-1"><Eye size={15} /> {p.viewsCount || 0}</span>
                    <span className="flex items-center gap-1"><Heart size={15} /> {p.favoritesCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Delete confirmation ---------- */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl2 bg-surface p-6 shadow-xl"
          >
            <h3 className="font-display text-lg font-semibold text-ink">Remove this listing?</h3>
            <p className="mt-2 text-sm text-ink/60">
              {confirmProperty ? `"${confirmProperty.title}" ` : "This listing "}
              will be permanently deleted along with its photos. This can't be undone.
            </p>
            {deleteError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600" role="alert">
                {deleteError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleting}
                className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? "Removing..." : "Delete listing"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ---------- Edit profile / Settings modal ---------- */}
      <AnimatePresence>
        {modalOpen && (
          <EditProfileModal
            tab={modalTab}
            setTab={setModalTab}
            user={user}
            updateProfile={updateProfile}
            onClose={() => setModalOpen(false)}
            onSaved={(message) => {
              setModalOpen(false);
              showToast(message);
            }}
          />
        )}
      </AnimatePresence>

      {/* ---------- Success popup ---------- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-6 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-xl"
          >
            <CheckCircle2 size={18} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EditProfileModal({ tab, setTab, user, updateProfile, onClose, onSaved }) {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "");
  const [area, setArea] = useState(user?.area || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  async function saveProfile(e) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);
    try {
      await updateProfile({ name, bio, phone, city, area });
      onSaved("Profile updated successfully!");
    } catch (err) {
      setProfileError(err.message || "Could not update your profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await changePasswordRequest({ currentPassword, newPassword });
      setPasswordSuccess("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || "Could not update your password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-xl2 bg-surface shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <div className="flex gap-4">
            <button
              onClick={() => setTab("profile")}
              className={`text-sm font-semibold ${tab === "profile" ? "text-ink" : "text-ink/40"}`}
            >
              Edit Profile
            </button>
            <button
              onClick={() => setTab("password")}
              className={`text-sm font-semibold ${tab === "password" ? "text-ink" : "text-ink/40"}`}
            >
              Change Password
            </button>
          </div>
          <button onClick={onClose} className="text-ink/50 hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          {tab === "profile" ? (
            <form onSubmit={saveProfile} className="space-y-4">
              <Field label="Name" value={name} onChange={setName} required />
              <div>
                <label className="mb-1 block text-xs font-medium text-ink/60">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Tell renters a bit about yourself..."
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-ink/40 focus:outline-none"
                />
              </div>
              <Field label="Phone" value={phone} onChange={setPhone} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" value={city} onChange={setCity} />
                <Field label="Area" value={area} onChange={setArea} />
              </div>

              {profileError && <p className="text-xs text-red-500">{profileError}</p>}
              {profileSuccess && <p className="text-xs text-green-600">{profileSuccess}</p>}

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-aqua hover:text-paper disabled:opacity-60"
              >
                {profileSaving ? "Saving..." : "Save changes"}
              </button>
            </form>
          ) : (
            <form onSubmit={savePassword} className="space-y-4">
              <Field label="Current password" type="password" value={currentPassword} onChange={setCurrentPassword} required />
              <Field label="New password" type="password" value={newPassword} onChange={setNewPassword} required />
              <Field label="Confirm new password" type="password" value={confirmPassword} onChange={setConfirmPassword} required />

              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
              {passwordSuccess && <p className="text-xs text-green-600">{passwordSuccess}</p>}

              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-aqua hover:text-paper disabled:opacity-60"
              >
                {passwordSaving ? "Updating..." : "Update password"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink/60">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-ink/40 focus:outline-none"
      />
    </div>
  );
}