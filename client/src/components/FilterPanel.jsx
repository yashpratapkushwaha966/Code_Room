import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { PROPERTY_TYPES, AMENITIES_LIST } from "../data/properties.js";

const FURNISHING = ["Unfurnished", "Semi Furnished", "Fully Furnished"];

function FilterBody({ filters, setFilters }) {
  function update(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }
  function toggleAmenity(a) {
    setFilters((f) => {
      const list = f.amenities || [];
      return { ...f, amenities: list.includes(a) ? list.filter((x) => x !== a) : [...list, a] };
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Property Type</p>
        <div className="flex flex-wrap gap-2">
          {["all", ...PROPERTY_TYPES].map((t) => (
            <button
              key={t}
              onClick={() => update("propertyType", t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filters.propertyType === t
                  ? "border-sage bg-sage text-white"
                  : "border-ink/15 text-ink/70 hover:border-ink/30"
              }`}
            >
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Bedrooms</p>
        <div className="flex gap-2">
          {["", "1", "2", "3", "4"].map((b) => (
            <button
              key={b}
              onClick={() => update("bhk", b)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filters.bhk === b ? "border-sage bg-sage text-white" : "border-ink/15 text-ink/70"
              }`}
            >
              {b === "" ? "Any" : b === "4" ? "4+" : b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Rent range (₹/month)</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minRent}
            onChange={(e) => update("minRent", e.target.value)}
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxRent}
            onChange={(e) => update("maxRent", e.target.value)}
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Furnishing</p>
        <div className="flex flex-wrap gap-2">
          {FURNISHING.map((f) => (
            <button
              key={f}
              onClick={() => update("furnishing", filters.furnishing === f ? "" : f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filters.furnishing === f ? "border-sage bg-sage text-white" : "border-ink/15 text-ink/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Amenities</p>
        <div className="flex flex-wrap gap-2">
          {AMENITIES_LIST.map((a) => (
            <button
              key={a}
              onClick={() => toggleAmenity(a)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                (filters.amenities || []).includes(a)
                  ? "border-sage bg-sage text-white"
                  : "border-ink/15 text-ink/70"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FilterPanel({ filters, setFilters, onReset, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="rounded-xl2 border border-ink/10 bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display font-semibold text-ink">Filters</p>
            <button onClick={onReset} className="text-xs font-medium text-sage hover:underline">
              Reset
            </button>
          </div>
          <FilterBody filters={filters} setFilters={setFilters} />
        </div>
      </aside>

      {/* Mobile bottom-sheet drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-surface p-5 lg:hidden"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display font-semibold text-ink">Filters</p>
                <button onClick={() => setMobileOpen(false)} aria-label="Close filters">
                  <X size={20} />
                </button>
              </div>
              <FilterBody filters={filters} setFilters={setFilters} />
              <div className="mt-6 flex gap-3">
                <button
                  onClick={onReset}
                  className="flex-1 rounded-lg border border-ink/15 py-2.5 text-sm font-semibold text-ink/70"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-aqua py-2.5 text-sm font-semibold text-paper"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
