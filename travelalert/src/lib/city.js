export const CITY_RE = /^[\p{L}\p{M}\s.'()-]{2,60}$/u;

export function normalizeCity(raw) {
  const city = String(raw || "").trim().replace(/\s+/g, " ");
  if (!CITY_RE.test(city)) return "";
  return city;
}

export function cityKey(city) {
  return normalizeCity(city).toLowerCase();
}