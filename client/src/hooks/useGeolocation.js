import { useCallback, useState } from "react";

// Wraps the browser Geolocation API. Kept as a hook (rather than inline
// in SearchBar) so any component can trigger "use my location" the same
// way, and so the permission-denied message stays consistent everywhere.
export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported on this device.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError("Location permission was not granted.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return { coords, error, loading, request };
}
