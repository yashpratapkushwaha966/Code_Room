import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MapPin, Ruler } from "lucide-react";
import { formatRent, formatBhk } from "../utils/format.js";
import { formatDistance } from "../utils/distance.js";
import { useFavorites } from "../hooks/useFavorites.js";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function PropertyCard({ property, index = 0 }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(property.id);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-xl2 border border-ink/10 bg-surface shadow-sm transition-shadow hover:shadow-lg"
    >
      <Link to={`/property/${property.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.images?.[0]}
            alt={property.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-surface/70 px-2.5 py-1 text-[11px] font-semibold text-ink">
            {property.propertyType}
          </span>
          <motion.button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(property.id);
            }}
            whileTap={{ scale: 0.8 }}
            aria-label="Toggle favorite"
            className="absolute right-3 top-3 rounded-full bg-surface/70 p-2 shadow-sm"
          >
            <Heart size={16} className={fav ? "fill-red-500 text-red-500" : "text-ink/50"} />
          </motion.button>
        </div>

        <div className="p-4">
          <h3 className="truncate font-display text-base font-semibold text-ink">{property.title}</h3>
          <p className="mt-1 text-lg font-bold text-aqua">
            {formatRent(property.rent)} <span className="text-xs font-medium text-ink/50">/month</span>
          </p>

          <p className="mt-2 flex items-center gap-1 text-sm text-ink/60">
            <MapPin size={13} /> {property.area}, {property.city}
          </p>
          {property.distanceKm != null && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-sage">
              <Ruler size={12} /> {formatDistance(property.distanceKm)}
            </p>
          )}

          <p className="mt-2 text-xs text-ink/60">
            {formatBhk(property.bhk, property.propertyType)} · {property.furnishing}
          </p>
          <p className="mt-1 truncate text-xs text-ink/40">{property.amenities.join(" · ")}</p>
        </div>
      </Link>
    </motion.div>
  );
}
