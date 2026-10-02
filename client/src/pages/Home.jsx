import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocateFixed, Loader2 } from "lucide-react";
import Hero from "../components/Hero.jsx";
import PropertyGrid from "../components/PropertyGrid.jsx";
import { getFeaturedProperties, getProperties } from "../services/propertyService.js";
import { useGeolocation } from "../hooks/useGeolocation.js";

const RADIUS_KM = 15;

export default function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingLocation, setUsingLocation] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [nearestDistance, setNearestDistance] = useState(null);
  const { coords, error, loading: locLoading, request } = useGeolocation();

  // Ask for the user's location as soon as the page loads, so "near you"
  // actually means near their current position (falls back to featured
  // homes below if permission is denied/unavailable).
  useEffect(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (coords) {
      setLoading(true);
      setRecommended([]);
      setNearestDistance(null);
      getProperties({
        userLat: coords.latitude,
        userLng: coords.longitude,
        radiusKm: RADIUS_KM,
        sort: "nearest",
      }).then((data) => {
        if (cancelled) return;
        setUsingLocation(true);
        setProperties(data);
        setLoading(false);

        // Nothing within the radius — don't dead-end the page, show a
        // recommended pick from anywhere instead, and tell the user how
        // far the actual closest listing is (useful to spot bad geocoding
        // vs. genuinely no nearby listings).
        if (data.length === 0) {
          setLoadingRecommended(true);
          Promise.all([
            getProperties({ sort: "recommended", limit: 6 }),
            getProperties({
              userLat: coords.latitude,
              userLng: coords.longitude,
              radiusKm: 20000, // effectively unrestricted — just want real distance
              sort: "nearest",
              limit: 1,
            }),
          ]).then(([rec, nearest]) => {
            if (cancelled) return;
            setRecommended(rec);
            setNearestDistance(nearest[0]?.distanceKm ?? null);
            setLoadingRecommended(false);
          });
        }
      });
    } else if (error) {
      setLoading(true);
      getFeaturedProperties().then((data) => {
        if (cancelled) return;
        setUsingLocation(false);
        setProperties(data);
        setLoading(false);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [coords, error]);

  const showRecommended = usingLocation && !loading && properties.length === 0;

  return (
    <div>
      <Hero />
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">

        {showRecommended && (
          <div className="mt-12">
            <div className="border-t border-ink/10 pt-8">
              <h2 className="font-display text-xl font-bold text-ink">Recommended for you</h2>
              <p className="mt-1 text-sm text-ink/60">
                Nothing nearby yet, but here's what people are liking elsewhere.
              </p>
              <div className="mt-6">
                <PropertyGrid properties={recommended} loading={loadingRecommended} />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              {usingLocation ? "Homes near you" : "Featured near you"}
            </h2>
            <p className="mt-1 text-sm text-ink/60">
              {usingLocation
                ? `Rooms and homes within ${RADIUS_KM} km of your current location.`
                : "A handful of homes people are checking out right now."}
            </p>
          </div>

          <button
            type="button"
            onClick={request}
            className="flex items-center gap-1.5 text-sm font-medium text-sage transition hover:text-ink"
          >
            {locLoading ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
            Use my location
          </button>
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-500">
            {error} Showing featured homes instead — you can still search any city above.
          </p>
        )}

        {usingLocation && coords && (
          <p className="mt-2 text-xs text-ink/40">
            Detected location: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
            {nearestDistance != null && ` · Nearest listing is ${nearestDistance} km away`}
          </p>
        )}

        <div className="mt-6">
          <PropertyGrid
            properties={properties}
            loading={loading || locLoading}
            onResetFilters={() => navigate("/search")}
            emptyTitle={usingLocation ? `No homes within ${RADIUS_KM} km of you.` : "No featured homes right now."}
            emptySubtitle="Try browsing all homes, or search a specific city instead."
            emptyActionLabel="Browse all homes"
          />
        </div>

      </section>
    </div>
  );
}