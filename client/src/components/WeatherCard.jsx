import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Sun, Cloud, CloudSun, CloudRain, CloudSnow, CloudFog, CloudLightning, Loader2 } from "lucide-react";
import { getWeather, getWeatherByCoords } from "../services/weatherService.js";
import { reverseGeocodeCity } from "../services/geoService.js";
import { useGeolocation } from "../hooks/useGeolocation.js";

const ICONS = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  fog: CloudFog,
  storm: CloudLightning,
};

// `city` is only the starting point shown while we detect where the
// person actually is (and the fallback if location access is denied) —
// once GPS coords come through, the card switches to real live weather
// for wherever the person is standing.
export default function WeatherCard({ city = "Gwalior", compact = false }) {
  const [weather, setWeather] = useState(null);
  const { coords, request } = useGeolocation();

  // Ask for location as soon as the card mounts, so it shows the
  // person's real city/weather without needing a click.
  useEffect(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback: show the given city's weather immediately so the card
  // never sits empty while we wait on the geolocation permission prompt.
  useEffect(() => {
    let active = true;
    getWeather(city).then((w) => active && setWeather((prev) => prev || w));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once real GPS coords come in, resolve them to a city name and fetch
  // live weather for that exact location — this replaces the fallback.
  useEffect(() => {
    if (!coords) return;
    let active = true;
    (async () => {
      let label = city;
      try {
        const { city: detected } = await reverseGeocodeCity(coords.latitude, coords.longitude);
        if (detected) label = detected;
      } catch {
        // keep the fallback label
      }
      const w = await getWeatherByCoords(coords.latitude, coords.longitude, label);
      if (active) setWeather(w);
    })();
    return () => {
      active = false;
    };
  }, [coords, city]);

  const Icon = ICONS[weather?.icon] || Cloud;

  if (!weather) {
    return (
      <div
        className={
          compact
            ? "flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-ink/70 backdrop-blur"
            : "flex w-full max-w-xs items-center gap-2 rounded-xl2 border border-ink/10 bg-surface/70 p-5 text-sm text-ink/50 shadow-sm backdrop-blur"
        }
      >
        <Loader2 size={compact ? 13 : 16} className="animate-spin" /> Loading weather...
      </div>
    );
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-ink backdrop-blur-md"
      >
        <MapPin size={13} className="text-aqua" />
        <span className="text-xs font-medium">{weather.city}</span>
        <span className="h-3 w-px bg-white/25" />
        <Icon size={15} className="text-aqua" strokeWidth={1.5} />
        <span className="text-sm font-semibold">{weather.tempC}°C</span>
        <span className="hidden text-xs capitalize text-ink/60 sm:inline">{weather.condition}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="w-full max-w-xs rounded-xl2 border border-ink/10 bg-surface/70 p-5 shadow-sm backdrop-blur"
    >
      <div className="flex items-center gap-1.5 text-sm text-ink/60">
        <MapPin size={14} /> {weather.city}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="font-display text-3xl font-bold text-ink">{weather.tempC}°C</p>
          <p className="text-sm capitalize text-ink/70">{weather.condition}</p>
        </div>
        <Icon className="text-aqua" size={36} strokeWidth={1.5} />
      </div>
      <div className="mt-3 flex justify-between text-xs text-ink/50">
        <span>Feels like {weather.feelsLike}°C</span>
        <span>Humidity {weather.humidity}%</span>
      </div>
      {weather.isMock && (
        <p className="mt-2 text-[11px] text-ink/40">Couldn't reach the live weather service — showing example data.</p>
      )}
    </motion.div>
  );
}
