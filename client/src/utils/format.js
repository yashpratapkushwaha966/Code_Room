export function formatRent(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function formatBhk(bhk, propertyType) {
  if (propertyType === "PG/Room") return "Single Room";
  if (propertyType === "Studio") return "Studio";
  return `${bhk} BHK`;
}
