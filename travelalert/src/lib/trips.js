import { normalizeCity, resolveCity, cityKey } from "./city.js";

export const TRIP_MIN_DESTINATIONS = 3;
export const TRIP_MAX_DESTINATIONS = 6;
export const TRIP_NAME_MAX_LENGTH = 80;

// Normalize + dedupe a raw destinations input into trip rows.
// Reuses resolveCity/normalizeCity/cityKey — no new city logic.
// Accepts strings ("Paris") or objects ({ city, visit_date }).
// Returns { destinations } or { error }.
export function normalizeTripDestinations(input) {
  const list = Array.isArray(input) ? input : [];
  const seen = new Set();
  const destinations = [];

  for (const entry of list) {
    const rawCity = typeof entry === "string" ? entry : entry?.city;
    const rawDate = typeof entry === "string" ? null : entry?.visit_date || entry?.visitDate || null;
    const city = resolveCity(rawCity) || normalizeCity(rawCity);
    const key = city ? cityKey(city) : "";
    if (!city || !key || seen.has(key)) continue;
    seen.add(key);

    let visit_date = null;
    if (rawDate) {
      const parsed = new Date(String(rawDate));
      if (!Number.isNaN(parsed.getTime())) {
        visit_date = parsed.toISOString().slice(0, 10);
      }
    }

    destinations.push({ city, destination_key: key, visit_date });
  }

  if (destinations.length < TRIP_MIN_DESTINATIONS) {
    return { error: `Add at least ${TRIP_MIN_DESTINATIONS} destinations (up to ${TRIP_MAX_DESTINATIONS}).` };
  }
  if (destinations.length > TRIP_MAX_DESTINATIONS) {
    return { error: `Trips support up to ${TRIP_MAX_DESTINATIONS} destinations.` };
  }
  return { destinations };
}

export function normalizeTripName(raw) {
  const name = String(raw || "").trim().replace(/\s+/g, " ").slice(0, TRIP_NAME_MAX_LENGTH);
  return name || "My Trip";
}
