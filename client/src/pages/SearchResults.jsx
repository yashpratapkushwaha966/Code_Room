import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import FilterPanel from "../components/FilterPanel.jsx";
import SortSelect from "../components/SortSelect.jsx";
import PropertyGrid from "../components/PropertyGrid.jsx";
import { getProperties } from "../services/propertyService.js";

const emptyFilters = {
  propertyType: "all",
  bhk: "",
  minRent: "",
  maxRent: "",
  furnishing: "",
  amenities: [],
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    ...emptyFilters,
    propertyType: searchParams.get("propertyType") || "all",
    bhk: searchParams.get("bhk") || "",
    maxRent: searchParams.get("maxRent") || "",
  });
  const [sort, setSort] = useState("recommended");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const q = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";
  const userLat = searchParams.get("userLat");
  const userLng = searchParams.get("userLng");

  useEffect(() => {
    setLoading(true);
    getProperties({
      q,
      city,
      sort,
      userLat: userLat ? Number(userLat) : undefined,
      userLng: userLng ? Number(userLng) : undefined,
      ...filters,
    }).then((data) => {
      setProperties(data);
      setLoading(false);
    });
  }, [filters, sort, q, city, userLat, userLng]);

  function resetFilters() {
    setFilters(emptyFilters);
  }

  const heading = q ? `Homes matching "${q}"` : city ? `Homes in ${city}` : "Browse homes";

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">{heading}</h1>
          <p className="text-sm text-ink/50">{loading ? "Searching..." : `${properties.length} results`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-ink/15 px-3 py-2 text-sm font-medium lg:hidden"
          >
            <SlidersHorizontal size={15} /> Filters
          </button>
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      <div className="flex gap-6">
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          onReset={resetFilters}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <div className="flex-1">
          <PropertyGrid properties={properties} loading={loading} onResetFilters={resetFilters} />
        </div>
      </div>
    </div>
  );
}