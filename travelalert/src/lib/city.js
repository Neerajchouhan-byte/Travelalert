// More permissive regex to support international city names
export const CITY_RE = /^[\p{L}\p{M}\s.'()-\/]{2,80}$/u;

export function normalizeCity(raw) {
  if (!raw) return "";
  
  let city = String(raw).trim().replace(/\s+/g, " ");
  
  try {
    city = decodeURIComponent(city);
  } catch {
    // If decoding fails, use the original string
  }
  
  if (city.includes(",")) city = city.split(",")[0].trim().replace(/\s+/g, " ");
  
  city = city.replace(/[^\p{L}\p{M}\s.'()-]+$/gu, "");
  
  if (!CITY_RE.test(city)) return "";
  
  city = city.replace(/\b\w/g, (c) => c.toUpperCase());
  
  return city;
}

export function cityKey(city) {
  return normalizeCity(city).toLowerCase();
}

// Fuzzy city name matching for common variations.
// Aliases are matched exactly — no substring matching, which previously
// caused false positives like "asg" -> "Singapore" (contains "sg").
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

  if (CITY_ALIASES[key]) return CITY_ALIASES[key];

  return normalized;
}