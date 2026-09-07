import { normalizeCity } from "@/lib/city";

export const maxDuration = 10;

/**
 * GET /api/city-search?q=<query>
 * Returns multiple matching cities from Open-Meteo geocoding API
 * to help users disambiguate cities with the same name.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") || "";

  const query = normalizeCity(rawQuery);
  if (!query) {
    return Response.json({ cities: [] });
  }

  try {
    // Fetch multiple results to handle same-name cities
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?count=8&name=${encodeURIComponent(query)}&language=en&format=json`
    );

    if (!geoRes.ok) {
      return Response.json({ cities: [] });
    }

    const geo = await geoRes.json();
    const results = geo.results || [];

    // Map results to a consistent format with flags
    const cities = results.map((hit) => ({
      name: hit.name,
      country: hit.country,
      country_code: hit.country_code || null,
      admin1: hit.admin1 || null,
      latitude: hit.latitude,
      longitude: hit.longitude,
      timezone: hit.timezone || null,
      flag: flagFromCountryCode(hit.country_code),
      // Create a unique key for this city
      key: `${hit.name}-${hit.country_code}-${hit.admin1 || ""}`.toLowerCase().replace(/\s+/g, "-"),
    }));

    return Response.json({ cities });
  } catch (error) {
    console.error("city-search error:", error?.message || error);
    return Response.json({ cities: [] });
  }
}

/**
 * Convert a 2-letter country code to an emoji flag.
 */
function flagFromCountryCode(code) {
  if (!code || code.length !== 2) return "🌍";
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
