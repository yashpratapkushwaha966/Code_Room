import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useFavorites } from "../hooks/useFavorites.js";
import { fetchMyFavorites } from "../services/favoriteService.js";
import { getProperties } from "../services/propertyService.js";
import PropertyGrid from "../components/PropertyGrid.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Favorites() {
  const { favorites } = useFavorites();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const loadFavorites = user
      ? fetchMyFavorites()
      : getProperties({}).then((all) => all.filter((p) => favorites.includes(p.id)));

    loadFavorites
      .then((saved) => {
        if (active) setProperties(saved);
      })
      .catch((error) => {
        console.error("Failed to load favorites:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [favorites, user]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-bold text-ink">Your favorites</h1>
      <p className="mt-1 text-sm text-ink/60">Properties you've saved for later.</p>

      <div className="mt-6">
        {!loading && properties.length === 0 ? (
          <EmptyState
            title="No saved properties yet."
            subtitle="Tap the heart on any listing to save it here."
            actionLabel="Browse properties"
            onAction={() => navigate("/search")}
          />
        ) : (
          <PropertyGrid properties={properties} loading={loading} />
        )}
      </div>
    </div>
  );
}
