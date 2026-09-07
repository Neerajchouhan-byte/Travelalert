// More permissive regex to support international city names
export const CITY_RE = /^[\p{L}\p{M}\s.'()-\/]{2,80}$/u;

export function normalizeCity(raw) {
  if (!raw) return "";
  
  let city = String(raw).trim().replace(/\s+/g, " ");
  
  // Decode URL-encoded characters
  try {
    city = decodeURIComponent(city);
  } catch {
    // If decoding fails, use the original string
  }
  
  // Accept "Paris, France" style input by keeping only the city part —
  // commas would otherwise fail validation and look like a broken search.
  if (city.includes(",")) city = city.split(",")[0].trim().replace(/\s+/g, " ");
  
  // Remove any trailing special characters
  city = city.replace(/[^\p{L}\p{M}\s.'()-]+$/gu, "");
  
  if (!CITY_RE.test(city)) return "";
  
  // Capitalize first letter of each word
  city = city.replace(/\b\w/g, (c) => c.toUpperCase());
  
  return city;
}

export function cityKey(city) {
  return normalizeCity(city).toLowerCase();
}

// Fuzzy city name matching for common variations
const CITY_ALIASES = {
  "bangkok": "Bangkok",
  "bkk": "Bangkok",
  "bali": "Bali",
  "hanoi": "Hanoi",
  "tokyo": "Tokyo",
  "rome": "Rome",
  "barcelona": "Barcelona",
  "kualalumpur": "Kuala Lumpur",
  "kuala lumpur": "Kuala Lumpur",
  "kl": "Kuala Lumpur",
  "singapore": "Singapore",
  "sg": "Singapore",
  "prague": "Prague",
  "kathmandu": "Kathmandu",
  "colombo": "Colombo",
  "siemreap": "Siem Reap",
  "siem reap": "Siem Reap",
};

export function resolveCity(input) {
  const normalized = normalizeCity(input);
  if (!normalized) return null;
  
  const key = normalized.toLowerCase();
  
  // Check aliases first
  if (CITY_ALIASES[key]) {
    return CITY_ALIASES[key];
  }
  
  // Check if any alias is contained in the input
  for (const [alias, city] of Object.entries(CITY_ALIASES)) {
    if (key.includes(alias) || alias.includes(key)) {
      return city;
    }
  }
  
  return normalized;
}