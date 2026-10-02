import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchMyFavorites, addFavoriteRemote, removeFavoriteRemote } from "../services/favoriteService.js";

// Guests (not logged in) keep favorites in localStorage. Once logged in,
// favorites are read from and written to the real backend so they follow
// the person across devices.
const KEY = "rnm_favorites";

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState(readLocal);

  useEffect(() => {
    if (!user) {
      setFavorites(readLocal());
      return;
    }
    fetchMyFavorites()
      .then((props) => setFavorites(props.map((p) => p.id)))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) localStorage.setItem(KEY, JSON.stringify(favorites));
  }, [favorites, user]);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback(
    (id) => {
      const wasFavorite = favorites.includes(id);
      setFavorites((prev) => (wasFavorite ? prev.filter((f) => f !== id) : [...prev, id]));

      if (user) {
        const call = wasFavorite ? removeFavoriteRemote(id) : addFavoriteRemote(id);
        call.catch(() => {
          // revert the optimistic update if the backend call failed
          setFavorites((prev) => (wasFavorite ? [...prev, id] : prev.filter((f) => f !== id)));
        });
      }
    },
    [favorites, user]
  );

  return { favorites, isFavorite, toggleFavorite };
}
