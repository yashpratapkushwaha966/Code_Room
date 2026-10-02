import { MapPin } from "lucide-react";

// Clean map-style placeholder — normalizes lat/lng into a bounding box so
// markers sit in roughly the right relative position without a real map
// library. Swap the inner div for <GoogleMap/> or <MapContainer/> (Leaflet)
// once a map provider is connected; keep the `points` prop shape the same.
export default function MapSection({ points = [], height = 220 }) {
  if (!points.length) return null;

  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const pad = 0.01;
  const minLat = Math.min(...lats) - pad, maxLat = Math.max(...lats) + pad;
  const minLng = Math.min(...lngs) - pad, maxLng = Math.max(...lngs) + pad;

  return (
    <div
      className="relative overflow-hidden rounded-xl2 border border-ink/10 bg-[linear-gradient(135deg,#EEF3ED_25%,transparent_25%),linear-gradient(315deg,#EEF3ED_25%,transparent_25%)] bg-sage/5"
      style={{ height, backgroundSize: "24px 24px" }}
    >
      {points.map((p, i) => {
        const left = ((p.longitude - minLng) / (maxLng - minLng)) * 100;
        const top = 100 - ((p.latitude - minLat) / (maxLat - minLat)) * 100;
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${left}%`, top: `${top}%` }}
            title={p.label}
          >
            <MapPin size={p.primary ? 26 : 18} className={p.primary ? "fill-aqua text-ink" : "fill-ink/70 text-ink"} />
          </div>
        );
      })}
      <p className="absolute bottom-2 right-2 rounded bg-surface/70 px-2 py-0.5 text-[10px] text-ink/50">
        Map placeholder — connect Google Maps / Leaflet here
      </p>
    </div>
  );
}
