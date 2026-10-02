// -----------------------------------------------------------------------
// WEATHER SERVICE
//
// Uses Open-Meteo (https://open-meteo.com) — a completely free, keyless
// weather API — so live weather works immediately with zero setup. If
// VITE_WEATHER_API_KEY is set in .env, OpenWeatherMap is used instead
// (kept for anyone who already has a key), but it's optional now.
//
// getWeatherByCoords() is the real entry point — WeatherCard calls this
// with the user's actual GPS location (via useGeolocation) so the card
// always reflects where the person really is, instead of a hardcoded
// city. getWeather(city) is kept for places that only know a city name
// (e.g. a manually selected city) — it resolves to that city's centre
// coordinates and calls getWeatherByCoords under the hood.
// -----------------------------------------------------------------------

import { CITY_CENTRES } from "../data/properties.js";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const MOCK_WEATHER = {
  Gwalior: { tempC: 28, condition: "Partly Cloudy", feelsLike: 30, humidity: 62 },
  Bhopal: { tempC: 26, condition: "Clear", feelsLike: 27, humidity: 55 },
  Indore: { tempC: 27, condition: "Partly Cloudy", feelsLike: 29, humidity: 58 },
  Jaipur: { tempC: 31, condition: "Sunny", feelsLike: 34, humidity: 40 },
  Pune: { tempC: 24, condition: "Light Rain", feelsLike: 24, humidity: 78 },
  Lucknow: { tempC: 29, condition: "Hazy", feelsLike: 31, humidity: 60 },
};

// WMO weather codes (used by Open-Meteo) -> a short label + an icon key
// the WeatherCard can map to a lucide-react icon.
const WMO_CODES = {
  0: { condition: "Clear sky", icon: "sun" },
  1: { condition: "Mainly clear", icon: "sun" },
  2: { condition: "Partly cloudy", icon: "cloud-sun" },
  3: { condition: "Overcast", icon: "cloud" },
  45: { condition: "Fog", icon: "fog" },
  48: { condition: "Depositing rime fog", icon: "fog" },
  51: { condition: "Light drizzle", icon: "rain" },
  53: { condition: "Moderate drizzle", icon: "rain" },
  55: { condition: "Dense drizzle", icon: "rain" },
  56: { condition: "Freezing drizzle", icon: "rain" },
  57: { condition: "Freezing drizzle", icon: "rain" },
  61: { condition: "Slight rain", icon: "rain" },
  63: { condition: "Moderate rain", icon: "rain" },
  65: { condition: "Heavy rain", icon: "rain" },
  66: { condition: "Freezing rain", icon: "rain" },
  67: { condition: "Freezing rain", icon: "rain" },
  71: { condition: "Slight snow", icon: "snow" },
  73: { condition: "Moderate snow", icon: "snow" },
  75: { condition: "Heavy snow", icon: "snow" },
  77: { condition: "Snow grains", icon: "snow" },
  80: { condition: "Slight showers", icon: "rain" },
  81: { condition: "Moderate showers", icon: "rain" },
  82: { condition: "Violent showers", icon: "rain" },
  85: { condition: "Slight snow showers", icon: "snow" },
  86: { condition: "Heavy snow showers", icon: "snow" },
  95: { condition: "Thunderstorm", icon: "storm" },
  96: { condition: "Thunderstorm with hail", icon: "storm" },
  99: { condition: "Thunderstorm with hail", icon: "storm" },
};

function describeCode(code) {
  return WMO_CODES[code] || { condition: "—", icon: "cloud" };
}

async function fetchOpenMeteo(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code` +
    `&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather API error");
  const data = await res.json();
  const current = data.current;
  if (!current) throw new Error("Weather API returned no current data");
  const { condition, icon } = describeCode(current.weather_code);
  return {
    tempC: Math.round(current.temperature_2m),
    condition,
    icon,
    feelsLike: Math.round(current.apparent_temperature),
    humidity: Math.round(current.relative_humidity_2m),
    isMock: false,
  };
}

async function fetchOpenWeatherMap(latitude, longitude) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather API error");
  const data = await res.json();
  return {
    tempC: Math.round(data.main.temp),
    condition: data.weather?.[0]?.description ?? "—",
    icon: "cloud",
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    isMock: false,
  };
}

/**
 * Live weather for exact GPS coordinates — the primary entry point.
 * `label` is just the display name attached to the result (e.g. a
 * reverse-geocoded city name); it isn't used to fetch anything.
 */
export async function getWeatherByCoords(latitude, longitude, label = "Your location") {
  try {
    const result = API_KEY
      ? await fetchOpenWeatherMap(latitude, longitude)
      : await fetchOpenMeteo(latitude, longitude);
    return { city: label, ...result };
  } catch {
    const fallback = MOCK_WEATHER[label] || MOCK_WEATHER.Gwalior;
    return { city: label, icon: "cloud", ...fallback, isMock: true };
  }
}

/** Weather for a known city name (falls back to that city's centre coords). */
export async function getWeather(city = "Gwalior") {
  const centre = CITY_CENTRES[city];
  if (centre) {
    return getWeatherByCoords(centre.latitude, centre.longitude, city);
  }
  const fallback = MOCK_WEATHER[city] || MOCK_WEATHER.Gwalior;
  return { city, icon: "cloud", ...fallback, isMock: true };
}
