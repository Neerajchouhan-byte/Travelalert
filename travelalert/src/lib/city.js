export const CITY_RE = /^[\p{L}\p{M}\s.'()-]{2,60}$/u;

export function normalizeCity(raw) {
  let city = String(raw || "").trim().replace(/\s+/g, " ");
  // Accept "Paris, France" style input by keeping only the city part —
  // commas would otherwise fail validation and look like a broken search.
  if (city.includes(",")) city = city.split(",")[0].trim().replace(/\s+/g, " ");
  if (!CITY_RE.test(city)) return "";
  return city;
}

export function cityKey(city) {
  return normalizeCity(city).toLowerCase();
}