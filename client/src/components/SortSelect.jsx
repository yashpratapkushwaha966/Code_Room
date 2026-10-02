export default function SortSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm text-ink outline-none"
    >
      <option value="recommended">Recommended</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="nearest">Nearest</option>
      <option value="newest">Newest</option>
    </select>
  );
}
