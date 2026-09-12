// Curated display metadata for the twelve pre-loaded destinations. These are
// used for layout (flag emoji, region, language, timezone) — not as live
// signals. The previous `safety` and `alerts` fields on each entry were
// static numbers presented as current scores; they were removed. Live scores
// come from /api/briefing, which derives them from cached alert data.

export const destinationMeta = {
  Bangkok: {
    flag: "🇹🇭",
    name: "Bangkok, Thailand",
    region: "Southeast Asia",
    currency: "Thai Baht (THB)",
    tz: "GMT+7",
    language: "Thai",
    cost: "Low",
  },
  Bali: {
    flag: "🇮🇩",
    name: "Bali, Indonesia",
    region: "Southeast Asia",
    currency: "Indonesian Rupiah (IDR)",
    tz: "GMT+8",
    language: "Indonesian",
    cost: "Low",
  },
  Hanoi: {
    flag: "🇻🇳",
    name: "Hanoi, Vietnam",
    region: "Southeast Asia",
    currency: "Vietnamese Dong (VND)",
    tz: "GMT+7",
    language: "Vietnamese",
    cost: "Low",
  },
  Tokyo: {
    flag: "🇯🇵",
    name: "Tokyo, Japan",
    region: "East Asia",
    currency: "Japanese Yen (JPY)",
    tz: "GMT+9",
    language: "Japanese",
    cost: "High",
  },
  "Siem Reap": {
    flag: "🇰🇭",
    name: "Siem Reap, Cambodia",
    region: "Southeast Asia",
    currency: "Cambodian Riel (KHR)",
    tz: "GMT+7",
    language: "Khmer",
    cost: "Low",
  },
  Rome: {
    flag: "🇮🇹",
    name: "Rome, Italy",
    region: "Southern Europe",
    currency: "Euro (EUR)",
    tz: "GMT+2",
    language: "Italian",
    cost: "High",
  },
  Barcelona: {
    flag: "🇪🇸",
    name: "Barcelona, Spain",
    region: "Southern Europe",
    currency: "Euro (EUR)",
    tz: "GMT+2",
    language: "Spanish",
    cost: "Medium",
  },
  "Kuala Lumpur": {
    flag: "🇲🇾",
    name: "Kuala Lumpur, Malaysia",
    region: "Southeast Asia",
    currency: "Malaysian Ringgit (MYR)",
    tz: "GMT+8",
    language: "Malay",
    cost: "Low",
  },
  Singapore: {
    flag: "🇸🇬",
    name: "Singapore",
    region: "Southeast Asia",
    currency: "Singapore Dollar (SGD)",
    tz: "GMT+8",
    language: "English",
    cost: "High",
  },
  Prague: {
    flag: "🇨🇿",
    name: "Prague, Czech Republic",
    region: "Central Europe",
    currency: "Czech Koruna (CZK)",
    tz: "GMT+2",
    language: "Czech",
    cost: "Medium",
  },
  Kathmandu: {
    flag: "🇳🇵",
    name: "Kathmandu, Nepal",
    region: "South Asia",
    currency: "Nepalese Rupee (NPR)",
    tz: "GMT+5:45",
    language: "Nepali",
    cost: "Low",
  },
  Colombo: {
    flag: "🇱🇰",
    name: "Colombo, Sri Lanka",
    region: "South Asia",
    currency: "Sri Lankan Rupee (LKR)",
    tz: "GMT+5:30",
    language: "Sinhala",
    cost: "Low",
  },
};

function inferTz(city) {
  const tzMap = {
    thailand: "GMT+7",
    indonesia: "GMT+8",
    vietnam: "GMT+7",
    japan: "GMT+9",
    cambodia: "GMT+7",
    italy: "GMT+2",
    spain: "GMT+2",
    malaysia: "GMT+8",
    singapore: "GMT+8",
    czech: "GMT+2",
    nepal: "GMT+5:45",
    sri: "GMT+5:30",
    india: "GMT+5:30",
    china: "GMT+8",
    korea: "GMT+9",
    australia: "GMT+10",
    "united states": "GMT-5",
    "united kingdom": "GMT+0",
    france: "GMT+2",
    germany: "GMT+2",
    brazil: "GMT-3",
    mexico: "GMT-6",
    canada: "GMT-5",
  };

  const lower = city.toLowerCase();
  for (const [key, tz] of Object.entries(tzMap)) {
    if (lower.includes(key)) return tz;
  }
  return "GMT+0";
}

export function getDestination(city) {
  const cached = findKnownCity(city) || destinationMeta[city];
  if (cached) return cached;

  return {
    flag: "🌍",
    name: city,
    region: "International",
    currency: "Local Currency",
    language: "Local",
    cost: "Medium",
    tz: inferTz(city),
  };
}

const COUNTRY_META = {
  TH: { region: "Southeast Asia", language: "Thai", cost: "Low" },
  ID: { region: "Southeast Asia", language: "Indonesian", cost: "Low" },
  VN: { region: "Southeast Asia", language: "Vietnamese", cost: "Low" },
  MM: { region: "Southeast Asia", language: "Burmese", cost: "Low" },
  LA: { region: "Southeast Asia", language: "Lao", cost: "Low" },
  KH: { region: "Southeast Asia", language: "Khmer", cost: "Low" },
  MY: { region: "Southeast Asia", language: "Malay", cost: "Low" },
  SG: { region: "Southeast Asia", language: "English", cost: "High" },
  PH: { region: "Southeast Asia", language: "Filipino", cost: "Low" },
  BN: { region: "Southeast Asia", language: "Malay", cost: "Low" },
  JP: { region: "East Asia", language: "Japanese", cost: "High" },
  KR: { region: "East Asia", language: "Korean", cost: "High" },
  CN: { region: "East Asia", language: "Chinese", cost: "Medium" },
  TW: { region: "East Asia", language: "Mandarin", cost: "Medium" },
  HK: { region: "East Asia", language: "Cantonese", cost: "High" },
  MN: { region: "Central Asia", language: "Mongolian", cost: "Low" },
  KZ: { region: "Central Asia", language: "Kazakh", cost: "Medium" },
  UZ: { region: "Central Asia", language: "Uzbek", cost: "Low" },
  IN: { region: "South Asia", language: "Hindi", cost: "Low" },
  PK: { region: "South Asia", language: "Urdu", cost: "Low" },
  BD: { region: "South Asia", language: "Bengali", cost: "Low" },
  NP: { region: "South Asia", language: "Nepali", cost: "Low" },
  LK: { region: "South Asia", language: "Sinhala", cost: "Low" },
  IT: { region: "Southern Europe", language: "Italian", cost: "High" },
  ES: { region: "Southern Europe", language: "Spanish", cost: "Medium" },
  PT: { region: "Southern Europe", language: "Portuguese", cost: "Medium" },
  GR: { region: "Southern Europe", language: "Greek", cost: "High" },
  HR: { region: "Southern Europe", language: "Croatian", cost: "Medium" },
  RS: { region: "Southern Europe", language: "Serbian", cost: "Medium" },
  AL: { region: "Southern Europe", language: "Albanian", cost: "Low" },
  CZ: { region: "Central Europe", language: "Czech", cost: "Medium" },
  PL: { region: "Central Europe", language: "Polish", cost: "Medium" },
  HU: { region: "Central Europe", language: "Hungarian", cost: "Medium" },
  SK: { region: "Central Europe", language: "Slovak", cost: "Medium" },
  RO: { region: "Eastern Europe", language: "Romanian", cost: "Medium" },
  RU: { region: "Eastern Europe", language: "Russian", cost: "Medium" },
  UA: { region: "Eastern Europe", language: "Ukrainian", cost: "Medium" },
  BG: { region: "Eastern Europe", language: "Bulgarian", cost: "Low" },
  GE: { region: "Western Asia", language: "Georgian", cost: "Medium" },
  TR: { region: "Western Asia", language: "Turkish", cost: "Medium" },
  GB: { region: "Western Europe", language: "English", cost: "High" },
  IE: { region: "Western Europe", language: "English", cost: "High" },
  FR: { region: "Western Europe", language: "French", cost: "High" },
  DE: { region: "Western Europe", language: "German", cost: "High" },
  NL: { region: "Western Europe", language: "Dutch", cost: "High" },
  BE: { region: "Western Europe", language: "Dutch", cost: "High" },
  CH: { region: "Western Europe", language: "German", cost: "High" },
  AT: { region: "Western Europe", language: "German", cost: "High" },
  SE: { region: "Northern Europe", language: "Swedish", cost: "High" },
  NO: { region: "Northern Europe", language: "Norwegian", cost: "High" },
  DK: { region: "Northern Europe", language: "Danish", cost: "High" },
  FI: { region: "Northern Europe", language: "Finnish", cost: "High" },
  IS: { region: "Northern Europe", language: "Icelandic", cost: "High" },
  US: { region: "North America", language: "English", cost: "High" },
  CA: { region: "North America", language: "English", cost: "High" },
  MX: { region: "North America", language: "Spanish", cost: "Low" },
  CR: { region: "Central America", language: "Spanish", cost: "Low" },
  PA: { region: "Central America", language: "Spanish", cost: "Low" },
  GT: { region: "Central America", language: "Spanish", cost: "Low" },
  CU: { region: "Caribbean", language: "Spanish", cost: "Low" },
  DO: { region: "Caribbean", language: "Spanish", cost: "Low" },
  JM: { region: "Caribbean", language: "English", cost: "Medium" },
  BR: { region: "South America", language: "Portuguese", cost: "Medium" },
  AR: { region: "South America", language: "Spanish", cost: "Low" },
  CL: { region: "South America", language: "Spanish", cost: "Low" },
  PE: { region: "South America", language: "Spanish", cost: "Low" },
  CO: { region: "South America", language: "Spanish", cost: "Medium" },
  AU: { region: "Oceania", language: "English", cost: "High" },
  NZ: { region: "Oceania", language: "English", cost: "High" },
  AE: { region: "Middle East", language: "Arabic", cost: "High" },
  SA: { region: "Middle East", language: "Arabic", cost: "High" },
  QA: { region: "Middle East", language: "Arabic", cost: "High" },
  KW: { region: "Middle East", language: "Arabic", cost: "High" },
  IL: { region: "Middle East", language: "Hebrew", cost: "High" },
  JO: { region: "Middle East", language: "Arabic", cost: "Medium" },
  OM: { region: "Middle East", language: "Arabic", cost: "Medium" },
  IR: { region: "Middle East", language: "Persian", cost: "Low" },
  IQ: { region: "Middle East", language: "Arabic", cost: "Medium" },
  LB: { region: "Middle East", language: "Arabic", cost: "Medium" },
  EG: { region: "North Africa", language: "Arabic", cost: "Low" },
  MA: { region: "North Africa", language: "Arabic", cost: "Low" },
  TN: { region: "North Africa", language: "Arabic", cost: "Low" },
  ET: { region: "East Africa", language: "Amharic", cost: "Low" },
  KE: { region: "East Africa", language: "Swahili", cost: "Low" },
  TZ: { region: "East Africa", language: "Swahili", cost: "Low" },
  ZA: { region: "Southern Africa", language: "English", cost: "Medium" },
  NG: { region: "West Africa", language: "English", cost: "Low" },
  GH: { region: "West Africa", language: "English", cost: "Low" },
};

export function flagFromCountryCode(code) {
  const cc = String(code || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "🌍";
  const a = cc.charCodeAt(0) - 65 + 0x1f1e6;
  const b = cc.charCodeAt(1) - 65 + 0x1f1e6;
  return String.fromCodePoint(a, b);
}

export function countryInfo(code) {
  const cc = String(code || "").toUpperCase();
  return COUNTRY_META[cc] || null;
}

/**
 * Rough destination-specific safety score derived from the mix of
 * high / medium alerts. Used by DestinationHeader via /api/briefing — this
 * is the ONLY place a safety number should be produced. Do not display a
 * static score anywhere else.
 */
export function estimateSafety(alerts = []) {
  if (!Array.isArray(alerts) || alerts.length === 0) return null;
  let high = 0;
  let medium = 0;
  for (const a of alerts) {
    const sev = String(a?.severity || a?.level || "medium").toLowerCase();
    if (sev === "high") high += 1;
    else if (sev === "medium") medium += 1;
  }
  const score = 8.6 - high * 0.35 - medium * 0.12;
  return Number(Math.min(9.5, Math.max(4.0, score)).toFixed(1));
}

export function isKnownCity(city) {
  return Boolean(findKnownCity(city));
}

export function findKnownCity(city) {
  const key = String(city || "").trim().toLowerCase();
  if (!key) return null;
  for (const [name, meta] of Object.entries(destinationMeta)) {
    if (name.toLowerCase() === key) return meta;
  }
  return null;
}

export function buildDestinationMeta(city, brief) {
  const base = getDestination(city);
  if (isKnownCity(city)) return base;

  const cc = brief?.country_code || brief?.countryCode || "";
  const country = countryInfo(cc) || {};

  return {
    ...base,
    flag: country.flag || flagFromCountryCode(cc),
    name: [brief?.city || city, brief?.country].filter(Boolean).join(", ") || city,
    region: country.region || brief?.country || base.region,
    language: country.language || base.language,
    cost: country.cost || base.cost,
    currency: brief?.code
      ? `${brief.currencyName || brief.code} (${brief.code})`
      : base.currency,
    tz: brief?.tz || base.tz,
  };
}

// Navigation-only city list. No score, no tone, no arrow — those were
// hardcoded per-city values shown as if derived from live data.
export const cities = [
  { flag: "🇹🇭", name: "Bangkok" },
  { flag: "🇮🇩", name: "Bali" },
  { flag: "🇻🇳", name: "Hanoi" },
  { flag: "🇯🇵", name: "Tokyo" },
  { flag: "🇰🇭", name: "Siem Reap" },
  { flag: "🇮🇹", name: "Rome" },
  { flag: "🇪🇸", name: "Barcelona" },
  { flag: "🇲🇾", name: "Kuala Lumpur" },
  { flag: "🇸🇬", name: "Singapore" },
  { flag: "🇨🇿", name: "Prague" },
  { flag: "🇳🇵", name: "Kathmandu" },
  { flag: "🇱🇰", name: "Colombo" },
];