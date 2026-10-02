import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, LocateFixed, Loader2 } from "lucide-react";
import { PROPERTY_TYPES, CITY_CENTRES } from "../data/properties.js";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { useAuth } from "../context/AuthContext.jsx";

const CITIES = Object.keys(CITY_CENTRES);

export default function SearchBar({ compact = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coords, error, loading, request } = useGeolocation();
  const [form, setForm] = useState({ city: "", propertyType: "all", bhk: "", maxRent: "" });

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.city) params.set("city", form.city);
    if (form.propertyType !== "all") params.set("propertyType", form.propertyType);
    if (form.bhk) params.set("bhk", form.bhk);
    if (form.maxRent) params.set("maxRent", form.maxRent);
    if (coords) {
      params.set("userLat", coords.latitude);
      params.set("userLng", coords.longitude);
    }

    const search = params.toString();
    const destination = `/search${search ? `?${search}` : ""}`;

    // Browsing is open to everyone, but actually running a search requires
    // being logged in — send them to log in first, then bounce them back
    // to this exact search once they're done.
    if (!user) {
      navigate("/login", {
        state: {
          from: { pathname: "/search", search: search ? `?${search}` : "" },
          message: "Please log in to search for properties.",
        },
      });
      return;
    }

    navigate(destination);
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`w-full rounded-2xl border border-ink/10 bg-surface shadow-lg shadow-ink/5 ${
        compact ? "p-3" : "p-4 sm:p-5"
      }`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="text-xs font-medium text-ink/50">Location</span>
          <div className="flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2.5">
            <MapPin size={16} className="text-ink/40" />
            <select
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            >
              <option value="">Any city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink/50">Property type</span>
          <select
            value={form.propertyType}
            onChange={(e) => update("propertyType", e.target.value)}
            className="rounded-lg border border-ink/10 px-3 py-2.5 text-sm outline-none"
          >
            <option value="all">Any type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink/50">Bedrooms</span>
          <select
            value={form.bhk}
            onChange={(e) => update("bhk", e.target.value)}
            className="rounded-lg border border-ink/10 px-3 py-2.5 text-sm outline-none"
          >
            <option value="">Any</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink/50">Max rent (₹/mo)</span>
          <input
            type="number"
            value={form.maxRent}
            onChange={(e) => update("maxRent", e.target.value)}
            placeholder="20,000"
            className="rounded-lg border border-ink/10 px-3 py-2.5 text-sm outline-none placeholder:text-ink/40"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={request}
          className="flex items-center gap-1.5 text-sm font-medium text-sage transition hover:text-ink"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
          Use my location
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-aqua px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-aqua-light"
        >
          <Search size={16} /> Search Properties
        </button>
      </div>

      {!user && (
        <p className="mt-2 text-xs text-ink/50">You'll need to log in before searching.</p>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{error} You can still search by choosing a city above.</p>}
      {coords && !error && (
        <p className="mt-2 text-xs text-sage">Location detected — results will be sorted by distance.</p>
      )}
    </form>
  );
}
