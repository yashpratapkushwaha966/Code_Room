import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UploadCloud, X, Video, MapPin, Phone } from "lucide-react";
import { addProperty } from "../services/propertyService.js";
import { uploadPropertyImages, uploadPropertyVideo } from "../services/uploadService.js";
import { geocodeAddress, reverseGeocodeCity } from "../services/geoService.js";
import { PROPERTY_TYPES, AMENITIES_LIST, CITY_CENTRES } from "../data/properties.js";

const CITIES = Object.keys(CITY_CENTRES);

const MAX_IMAGES = 8;

const initial = {
  title: "",
  description: "",
  city: "",
  area: "",
  address: "",
  propertyType: "Apartment",
  bhk: 1,
  rent: "",
  deposit: "",
  furnishing: "Semi Furnished",
  amenities: [],
  availableFrom: "",
  contactPhone: "",
  whatsapp: "",
};

export default function AddProperty() {
  const [form, setForm] = useState(initial);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [showLocationPin, setShowLocationPin] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [locating, setLocating] = useState(false);
  const [sameAsCall, setSameAsCall] = useState(true);
  const [cityAutoNote, setCityAutoNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleAmenity(a) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  }

  function handleImageSelect(e) {
    const files = Array.from(e.target.files || []).slice(0, MAX_IMAGES);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  }

  function removeImage(i) {
    setImageFiles((f) => f.filter((_, idx) => idx !== i));
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
  }

  function handleVideoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  }

  function removeVideo() {
    setVideoFile(null);
    setVideoPreview("");
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Location access isn't supported in this browser.");
      return;
    }
    setLocating(true);
    setCityAutoNote("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setManualLat(String(latitude));
        setManualLng(String(longitude));

        // Detect the actual city from the GPS coordinates and override the
        // City field with it — this is what stops someone standing in
        // Bhopal from ending up with "Indore" (or any other mismatched
        // city) still selected from an earlier manual pick.
        try {
          const { city } = await reverseGeocodeCity(latitude, longitude);
          if (city) {
            const matched = CITIES.find((c) => c.toLowerCase() === city.toLowerCase());
            update("city", matched || city);
            setCityAutoNote(`City set to "${matched || city}" based on your current location.`);
          }
        } catch {
          // Non-fatal — the lat/lng pin is still set even if city lookup fails.
        }

        setLocating(false);
      },
      () => {
        setError("Could not fetch your current location. You can type it manually or skip this step.");
        setLocating(false);
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Photos are compulsory — everything else geocodes/uploads only after this passes.
    if (imageFiles.length === 0) {
      setError("Please add at least one photo of the property.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Resolve the location. If the owner set a manual pin, use it as-is;
      //    otherwise geocode the typed address/city (falls back to city centre).
      let latitude;
      let longitude;
      if (manualLat !== "" && manualLng !== "") {
        latitude = Number(manualLat);
        longitude = Number(manualLng);
      } else {
        setStatusText("Locating address...");
        const geo = await geocodeAddress(`${form.address}, ${form.area}, ${form.city}`);
        latitude = geo.latitude;
        longitude = geo.longitude;
      }

      // 2. Upload images to Cloudinary first — never send raw files as JSON.
      //    Keep both url AND publicId (needed later so deleting the listing
      //    can actually remove the file from Cloudinary too).
      setStatusText("Uploading images...");
      const uploadedImages = await uploadPropertyImages(imageFiles);

      // 3. Optional single video.
      let uploadedVideos = [];
      if (videoFile) {
        setStatusText("Uploading video...");
        const uploadedVideo = await uploadPropertyVideo(videoFile);
        uploadedVideos = [uploadedVideo];
      }

      setStatusText("Saving listing...");
      await addProperty({
        ...form,
        bhk: Number(form.bhk),
        rent: Number(form.rent),
        deposit: Number(form.deposit),
        images: uploadedImages,
        videos: uploadedVideos,
        latitude,
        longitude,
      });

      setDone(true);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      // Real error from the API (validation, upload, geocoding, etc.) is
      // shown here instead of silently redirecting away.
      setError(err.message || "Could not save this listing. Please try again.");
    } finally {
      setSubmitting(false);
      setStatusText("");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-bold text-ink">List a property</h1>
      <p className="mt-1 text-sm text-ink/60">
        Your listing is created through the real <code>POST /api/properties</code> endpoint, with images
        uploaded to Cloudinary and the address geocoded automatically.
      </p>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-medium text-ink/50">Property title</span>
            <input required value={form.title} onChange={(e) => update("title", e.target.value)}
              className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none" placeholder="Modern 2 BHK Apartment" />
          </label>

          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-medium text-ink/50">Description</span>
            <textarea required rows={3} value={form.description} onChange={(e) => update("description", e.target.value)}
              className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink/50">City</span>
            <select
              value={form.city}
              onChange={(e) => { update("city", e.target.value); setCityAutoNote(""); }}
              className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none"
            >
              <option value="">Select a city</option>
              {/* If "Use my current location" detected a city outside our known list,
                  keep it selectable here instead of silently reverting to blank. */}
              {form.city && !CITIES.includes(form.city) && (
                <option value={form.city}>{form.city}</option>
              )}
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {cityAutoNote && <span className="text-[11px] text-sage">{cityAutoNote}</span>}
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink/50">Area</span>
            <input required value={form.area} onChange={(e) => update("area", e.target.value)}
              className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none" placeholder="City Centre" />
          </label>

          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-medium text-ink/50">Full address</span>
            <input required value={form.address} onChange={(e) => update("address", e.target.value)}
              className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink/50">Property type</span>
            <select value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)}
              className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none">
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink/50">BHK</span>
            <select value={form.bhk} onChange={(e) => update("bhk", e.target.value)}
              className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none">
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink/50">Rent (₹/month)</span>
            <input required type="number" value={form.rent} onChange={(e) => update("rent", e.target.value)}
              className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink/50">Deposit (₹)</span>
            <input required type="number" value={form.deposit} onChange={(e) => update("deposit", e.target.value)}
              className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink/50">Furnishing</span>
            <select value={form.furnishing} onChange={(e) => update("furnishing", e.target.value)}
              className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none">
              {["Unfurnished", "Semi Furnished", "Fully Furnished"].map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink/50">Available from</span>
            <input required type="date" value={form.availableFrom} onChange={(e) => update("availableFrom", e.target.value)}
              className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none" />
          </label>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-ink/50">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {AMENITIES_LIST.map((a) => (
              <button type="button" key={a} onClick={() => toggleAmenity(a)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  form.amenities.includes(a) ? "border-sage bg-sage text-white" : "border-ink/15 text-ink/70"
                }`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Contact number shown to interested renters on the listing page (Call / WhatsApp buttons) */}
        <div className="rounded-xl2 border border-ink/10 p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-ink/50">
            <Phone size={14} /> Contact number for this listing
          </p>
          <p className="mt-1 text-xs text-ink/40">
            Shown on the listing so interested renters can call or WhatsApp you directly.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink/50">Mobile number (for calls)</span>
              <input
                required
                type="tel"
                inputMode="tel"
                pattern="[+]?[0-9\s-]{7,15}"
                value={form.contactPhone}
                onChange={(e) => {
                  const value = e.target.value;
                  update("contactPhone", value);
                  if (sameAsCall) update("whatsapp", value);
                }}
                placeholder="98765 43210"
                className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink/50">WhatsApp number</span>
              <input
                type="tel"
                inputMode="tel"
                pattern="[+]?[0-9\s-]{7,15}"
                disabled={sameAsCall}
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                placeholder="98765 43210"
                className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none disabled:bg-ink/5 disabled:text-ink/40"
              />
            </label>
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs text-ink/60">
            <input
              type="checkbox"
              checked={sameAsCall}
              onChange={(e) => {
                const checked = e.target.checked;
                setSameAsCall(checked);
                if (checked) update("whatsapp", form.contactPhone);
              }}
            />
            WhatsApp number is the same as the call number
          </label>
        </div>

        {/* Optional manual location pin — auto-geocoded from the address if left closed */}
        <div className="rounded-xl2 border border-ink/10 p-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-medium text-ink/50">
              <MapPin size={14} /> Exact location pin (optional)
            </p>
            <button
              type="button"
              onClick={() => setShowLocationPin((v) => !v)}
              className="text-xs font-medium text-sage"
            >
              {showLocationPin ? "Hide" : "Set manually"}
            </button>
          </div>
          {!showLocationPin ? (
            <p className="mt-1 text-xs text-ink/40">
              Leave this closed and we'll locate the property from the address automatically.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-ink/50">Latitude</span>
                <input value={manualLat} onChange={(e) => setManualLat(e.target.value)} placeholder="26.2183"
                  className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-ink/50">Longitude</span>
                <input value={manualLng} onChange={(e) => setManualLng(e.target.value)} placeholder="78.1828"
                  className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none" />
              </label>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating}
                className="rounded-lg border border-ink/15 py-2 text-xs font-medium text-ink/70 hover:border-sage sm:col-span-2"
              >
                {locating ? "Fetching location..." : "Use my current location"}
              </button>
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-ink/50">
            Property images <span className="text-red-500">*</span> (at least 1 required, up to {MAX_IMAGES})
          </p>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl2 border border-dashed border-ink/20 p-6 text-center text-sm text-ink/50 hover:border-sage">
            <UploadCloud size={22} />
            Click to select images (up to {MAX_IMAGES}, uploaded to Cloudinary on save)
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
          </label>
          {imagePreviews.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 rounded-full bg-surface/70 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-ink/50">Property video (optional, 1 max)</p>
          {!videoFile ? (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl2 border border-dashed border-ink/20 p-6 text-center text-sm text-ink/50 hover:border-sage">
              <Video size={22} />
              Click to select a walkthrough video
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
            </label>
          ) : (
            <div className="relative mt-1 w-full max-w-xs overflow-hidden rounded-lg">
              <video src={videoPreview} controls className="w-full" />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute right-2 top-2 rounded-full bg-surface/70 p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-ink py-3 text-sm font-semibold text-paper transition hover:bg-aqua hover:text-paper disabled:opacity-60"
        >
          {submitting ? statusText || "Saving..." : done ? "Saved! Redirecting..." : "Save Property"}
        </motion.button>
      </form>
    </div>
  );
}