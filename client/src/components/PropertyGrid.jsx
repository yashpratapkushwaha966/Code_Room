import PropertyCard from "./PropertyCard.jsx";
import PropertyCardSkeleton from "./PropertyCardSkeleton.jsx";
import EmptyState from "./EmptyState.jsx";

export default function PropertyGrid({
  properties,
  loading,
  onResetFilters,
  emptyTitle = "No homes found in this area.",
  emptySubtitle = "Try widening your budget, changing the location, or clearing a filter.",
  emptyActionLabel = "Clear Filters",
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        subtitle={emptySubtitle}
        actionLabel={emptyActionLabel}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
    </div>
  );
}
