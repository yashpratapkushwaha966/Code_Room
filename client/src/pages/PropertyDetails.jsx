import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Ruler, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { getPropertyById, getNearbyProperties } from "../services/propertyService.js";
import { useFavorites } from "../hooks/useFavorites.js";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { formatRent, formatBhk } from "../utils/format.js";
import { distanceKm, formatDistance } from "../utils/distance.js";
import OwnerCard from "../components/OwnerCard.jsx";
import MapSection from "../components/MapSection.jsx";
import PropertyGrid from "../components/PropertyGrid.jsx";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { coords, request } = useGeolocation();

  useEffect(() => {
    setLoading(true);
    setImgIndex(0);
    getPropertyById(id).then(async (data) => {
      setProperty(data);
      if (data) setNearby(await getNearbyProperties(data));
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-5 py-16 text-center text-ink/50">Loading property...</div>;
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-16 text-center">
        <h2 className="font-display text-xl font-semibold text-ink">Property not found</h2>
        <Link to="/search" className="mt-3 inline-block text-sage underline">Back to search</Link>
      </div>
    );
  }

  const fav = isFavorite(property.id);
  const liveDistance = coords
    ? distanceKm(coords.latitude, coords.longitude, property.latitude, property.longitude)
    : null;

  const images = property.images?.length ? property.images : [];
  const videos = property.videos?.length ? property.videos : [];

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl2 bg-ink/5 sm:aspect-[16/9]">
        <AnimatePresence mode="wait">
          <motion.img
            key={imgIndex}
            src={images[imgIndex]}
            alt={property.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-surface/70 p-2"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setImgIndex((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-surface/70 p-2"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === imgIndex ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => toggleFavorite(property.id)}
          className="absolute right-3 top-3 rounded-full bg-surface/70 p-2.5"
          aria-label="Toggle favorite"
        >
          <Heart size={18} className={fav ? "fill-red-500 text-red-500" : "text-ink/50"} />
        </button>
      </div>

      {videos.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2 font-display font-semibold text-ink">Walkthrough video</h2>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl2 bg-black">
            <video
              key={videos[0]}
              src={videos[0]}
              controls
              playsInline
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold text-ink/70">
            {property.propertyType}
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">{property.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/60">
            <MapPin size={14} /> {property.address}
          </p>
          {(liveDistance ?? property.distanceKm) != null && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-sage">
              <Ruler size={13} /> {formatDistance(liveDistance ?? property.distanceKm)}
            </p>
          )}
          {liveDistance == null && (
            <button onClick={request} className="mt-1 text-xs font-medium text-sage underline">
              Use my location to see live distance
            </button>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Rent", `${formatRent(property.rent)}/mo`],
              ["Deposit", formatRent(property.deposit)],
              ["Type", formatBhk(property.bhk, property.propertyType)],
              ["Furnishing", property.furnishing],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-ink/10 p-3">
                <p className="text-[11px] text-ink/40">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="font-display font-semibold text-ink">About this place</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{property.description}</p>
          </div>

          <div className="mt-6">
            <h2 className="font-display font-semibold text-ink">Amenities</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <span key={a} className="rounded-full border border-ink/10 px-3 py-1 text-xs text-ink/70">{a}</span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-ink/60">
            <CalendarDays size={15} /> Available from {new Date(property.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>

          <div className="mt-6">
            <h2 className="mb-2 font-display font-semibold text-ink">Location</h2>
            <MapSection
              points={[{ latitude: property.latitude, longitude: property.longitude, primary: true, label: property.title }]}
            />
          </div>
        </div>

        <div className="space-y-4">
          <OwnerCard owner={property.ownerInfo} />
        </div>
      </div>

      {nearby.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold text-ink">Nearby properties</h2>
          <div className="mt-4">
            <PropertyGrid properties={nearby} loading={false} />
          </div>
        </div>
      )}
    </div>
  );
}