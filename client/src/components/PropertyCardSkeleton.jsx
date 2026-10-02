export default function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl2 border border-ink/10 bg-surface">
      <div className="h-44 animate-pulse bg-ink/10" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-ink/10" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-ink/10" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-ink/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-ink/10" />
      </div>
    </div>
  );
}
