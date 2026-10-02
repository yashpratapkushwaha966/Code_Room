import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Building2, ListChecks, Eye, Bookmark } from "lucide-react";

// Same headline numbers shown on the owner Dashboard — surfaced here too
// so every visitor (not just logged-in owners) sees the platform's scale
// right on the homepage. Update these once real aggregate counts are
// available from the backend (e.g. GET /api/stats).
const STATS = [
  { label: "Properties Listed", value: 12, icon: Building2 },
  { label: "Active Listings", value: 8, icon: ListChecks },
  { label: "Property Views", value: 1240, icon: Eye },
  { label: "Saved by Renters", value: 86, icon: Bookmark },
];

function AnimatedNumber({ value, duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return <span ref={ref}>{display.toLocaleString("en-IN")}</span>;
}

export default function StatsBar() {
  return (
    <section className="relative bg-surface/70 border-y border-ink/10 px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
        {STATS.map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
            className="flex flex-col items-center gap-2 text-center sm:border-r sm:border-white/10 sm:last:border-r-0"
          >
            <Icon size={20} className="text-aqua" strokeWidth={1.75} />
            <p className="font-display text-3xl font-bold text-ink sm:text-4xl">
              <AnimatedNumber value={value} />
              {value >= 1000 ? "+" : ""}
            </p>
            <p className="text-xs font-medium text-ink/60 sm:text-sm">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
