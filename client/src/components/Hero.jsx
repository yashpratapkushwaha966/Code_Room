import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, LocateFixed, Loader2 } from "lucide-react";
import WeatherCard from "./WeatherCard.jsx";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { useAuth } from "../context/AuthContext.jsx";

// Free-to-use (Mixkit license — no attribution required) background clips,
// picked for "room / bed" interiors so the hero actually looks like a
// rental site instead of a generic stock loop. If the primary clip can't
// load (offline, blocked, CDN hiccup) the component falls back to the
// second clip, then finally to a plain dark background — the page never
// breaks because of the video.
const BG_VIDEOS = [
  "https://assets.mixkit.co/videos/3112/3112-720.mp4",
  "https://assets.mixkit.co/videos/4029/4029-720.mp4",
];

export default function Hero() {
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coords, error, loading, request } = useGeolocation();

  function handleVideoError() {
    if (videoIndex < BG_VIDEOS.length - 1) {
      setVideoIndex((i) => i + 1);
    } else {
      setVideoFailed(true);
    }
  }

  function handleSearch() {
    const params = new URLSearchParams();
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

    const headline = ["Find a place", "that feels like home."];

  return (
    <section className="relative flex min-h-[560px] items-center overflow-hidden bg-paper px-5 py-24 sm:min-h-[640px] sm:px-8 lg:min-h-[88vh]">
      {/* Video is colour-graded to teal so it blends with the theme */}
      {!videoFailed && (
        <video
          key={BG_VIDEOS[videoIndex]}
          autoPlay
          muted
          loop
          playsInline
          onError={handleVideoError}
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-50 saturate-50"
        >
          <source src={BG_VIDEOS[videoIndex]} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-aqua-deep/30 mix-blend-color" />
      <div className="absolute inset-0 bg-gradient-to-b from-paper/80 via-paper/30 to-paper" />
      {/* Aqua glow that also acts as the fallback if the video can't load */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[620px] -translate-x-1/2 animate-drift rounded-full bg-aqua/20 blur-[120px]" />

      <div className="absolute right-5 top-6 z-10 sm:right-8 sm:top-8">
        <WeatherCard compact city="Gwalior" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <p className="mx-auto mb-7 w-fit rounded-full border border-aqua/30 bg-aqua/10 px-4 py-1.5 text-xs text-aqua-light backdrop-blur">
          Rooms, flats, houses and PGs near you
        </p>

        <h1 className="font-display font-light leading-[1.05] text-ink">
          {headline.map((line, li) => (
            <span key={line} className="block overflow-hidden pb-2">
              <motion.span
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1 + li * 0.14, ease: [0.16, 1, 0.3, 1] }}
                className={`block text-4xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] ${
                  li === 1 ? "bg-gradient-to-r from-ink via-aqua-light to-aqua bg-clip-text text-transparent" : ""
                }`}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base text-ink/65 sm:text-lg">
          Search once, compare fast, and message owners directly.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center gap-2 rounded-full bg-aqua px-9 py-4 text-sm font-semibold text-paper shadow-glow transition hover:bg-aqua-light sm:text-base"
          >
            <Search size={18} /> Search properties
          </button>

          <button
            type="button"
            onClick={request}
            className="flex items-center gap-2 rounded-full border border-ink/15 bg-ink/5 px-6 py-4 text-sm font-medium text-ink/85 backdrop-blur transition hover:border-aqua/50 hover:text-ink"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
            Use my location
          </button>
        </div>

        <div className="mt-4 min-h-[1.25rem]">
          {!user && <p className="text-xs text-ink/45">You'll need to log in before searching.</p>}
          {error && <p className="text-xs text-red-300">{error} You can still browse properties.</p>}
          {coords && !error && (
            <p className="text-xs text-sage">Location detected — results will be sorted by distance.</p>
          )}
        </div>
      </div>
    </section>
  );
}
