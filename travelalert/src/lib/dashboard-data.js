

export const destinationMeta = {
  Bangkok: {
    flag: "🇹🇭",
    name: "Bangkok, Thailand",
    region: "Southeast Asia",
    currency: "Thai Baht (THB)",
    tz: "GMT+7",
    language: "Thai",
    safety: "6.8",
    alerts: "12",
    cost: "Low",
    temp: "32°C",
  },
  Bali: {
    flag: "🇮🇩",
    name: "Bali, Indonesia",
    region: "Southeast Asia",
    currency: "Indonesian Rupiah (IDR)",
    tz: "GMT+8",
    language: "Indonesian",
    safety: "7.1",
    alerts: "9",
    cost: "Low",
    temp: "29°C",
  },
  Hanoi: {
    flag: "🇻🇳",
    name: "Hanoi, Vietnam",
    region: "Southeast Asia",
    currency: "Vietnamese Dong (VND)",
    tz: "GMT+7",
    language: "Vietnamese",
    safety: "7.4",
    alerts: "7",
    cost: "Low",
    temp: "28°C",
  },
  Tokyo: {
    flag: "🇯🇵",
    name: "Tokyo, Japan",
    region: "East Asia",
    currency: "Japanese Yen (JPY)",
    tz: "GMT+9",
    language: "Japanese",
    safety: "9.1",
    alerts: "3",
    cost: "High",
    temp: "24°C",
  },
  "Siem Reap": {
    flag: "🇰🇭",
    name: "Siem Reap, Cambodia",
    region: "Southeast Asia",
    currency: "Cambodian Riel (KHR)",
    tz: "GMT+7",
    language: "Khmer",
    safety: "6.5",
    alerts: "8",
    cost: "Low",
    temp: "31°C",
  },
  Rome: {
    flag: "🇮🇹",
    name: "Rome, Italy",
    region: "Southern Europe",
    currency: "Euro (EUR)",
    tz: "GMT+2",
    language: "Italian",
    safety: "7.0",
    alerts: "11",
    cost: "High",
    temp: "26°C",
  },
  Barcelona: {
    flag: "🇪🇸",
    name: "Barcelona, Spain",
    region: "Southern Europe",
    currency: "Euro (EUR)",
    tz: "GMT+2",
    language: "Spanish",
    safety: "6.9",
    alerts: "10",
    cost: "Medium",
    temp: "25°C",
  },
  "Kuala Lumpur": {
    flag: "🇲🇾",
    name: "Kuala Lumpur, Malaysia",
    region: "Southeast Asia",
    currency: "Malaysian Ringgit (MYR)",
    tz: "GMT+8",
    language: "Malay",
    safety: "8.2",
    alerts: "5",
    cost: "Low",
    temp: "31°C",
  },
  Singapore: {
    flag: "🇸🇬",
    name: "Singapore",
    region: "Southeast Asia",
    currency: "Singapore Dollar (SGD)",
    tz: "GMT+8",
    language: "English",
    safety: "9.4",
    alerts: "2",
    cost: "High",
    temp: "30°C",
  },
  Prague: {
    flag: "🇨🇿",
    name: "Prague, Czech Republic",
    region: "Central Europe",
    currency: "Czech Koruna (CZK)",
    tz: "GMT+2",
    language: "Czech",
    safety: "7.3",
    alerts: "6",
    cost: "Medium",
    temp: "18°C",
  },
  Kathmandu: {
    flag: "🇳🇵",
    name: "Kathmandu, Nepal",
    region: "South Asia",
    currency: "Nepalese Rupee (NPR)",
    tz: "GMT+5:45",
    language: "Nepali",
    safety: "6.8",
    alerts: "7",
    cost: "Low",
    temp: "22°C",
  },
  Colombo: {
    flag: "🇱🇰",
    name: "Colombo, Sri Lanka",
    region: "South Asia",
    currency: "Sri Lankan Rupee (LKR)",
    tz: "GMT+5:30",
    language: "Sinhala",
    safety: "7.0",
    alerts: "6",
    cost: "Low",
    temp: "30°C",
  },
};

// Try to infer timezone from country code or city name
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
  
  // Generate reasonable fallback for unknown cities
  return {
    flag: "🌍",
    name: city,
    region: "International",
    currency: "Local Currency",
    language: "Local",
    safety: "7.0",
    alerts: "5",
    cost: "Medium",
    temp: "25°C",
    tz: inferTz(city),
  };
}

// ISO 3166-1 alpha-2 → display info used to enrich arbitrary cities so a
// brand-new search renders the same complete header as the curated list.
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

/** Build the flag emoji for an ISO 3166-1 alpha-2 country code. */
export function flagFromCountryCode(code) {
  const cc = String(code || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "🌍";
  const a = cc.charCodeAt(0) - 65 + 0x1f1e6;
  const b = cc.charCodeAt(1) - 65 + 0x1f1e6;
  return String.fromCodePoint(a, b);
}

/** Look up region / language / cost tier for a country code. */
export function countryInfo(code) {
  const cc = String(code || "").toUpperCase();
  return COUNTRY_META[cc] || null;
}

/**
 * Rough but destination-specific safety score derived from the mix of
 * high / medium / low signals. Used only for cities without a curated
 * rating so a fresh search still yields a meaningful, stable score.
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

/** Case-insensitive lookup into the curated destination meta. */
export function findKnownCity(city) {
  const key = String(city || "").trim().toLowerCase();
  if (!key) return null;
  for (const [name, meta] of Object.entries(destinationMeta)) {
    if (name.toLowerCase() === key) return meta;
  }
  return null;
}

/**
 * Merge curated / fallback meta with live geocoding data so a search for any
 * destination renders a complete header (flag, region, timezone, language,
 * currency, cost). Curated values always win for the pre-loaded destinations.
 */
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
    temp: brief?.weather?.temp != null ? `${brief.weather.temp}°C` : base.temp,
  };
}

export const alerts = [
  {
    name: "Tuk-Tuk Free Temple Tour",
    level: "high",
    badge: "High risk",
    desc: "Driver offers a free city tour, then takes you to gem or tailor shops with extreme pressure to buy, averaging $200+ per victim.",
    avoid: "Refuse all free tour offers. Use the Grab app only.",
    source: "r/solotravel · reported 4× this week",
  },
  {
    name: "Taxi No-Meter Scam",
    level: "medium",
    badge: "Medium",
    desc: "Driver claims the meter is broken, then charges 3 to 5× fair price, especially from Suvarnabhumi airport late at night.",
    avoid: "Insist on the meter or book Grab before leaving arrivals.",
    source: "r/ThailandTourism · reported 7× this week",
  },
  {
    name: "Or Tor Kor Market, Safe Pick",
    level: "low",
    badge: "Tip",
    desc: "The safest, highest quality street food in Bangkok. Local prices, excellent hygiene, open mornings until 2pm.",
    avoid: "Best time is 7 to 10am. Avoid the tourist food courts nearby.",
    source: "r/solotravel · 847 upvotes",
  },
];

export const tips = [
  {
    icon: "taxi",
    title: "Transport, always use Grab",
    desc: "Fixed prices, tracked rides, no negotiation. Airport to city is roughly 280 THB versus 600+ with street taxis.",
    saving: "Saves about $9 per airport ride",
  },
  {
    icon: "food",
    title: "Food, Or Tor Kor Market",
    desc: "The safest, highest quality street food. Local prices, excellent variety. Avoid the tourist food courts nearby.",
    saving: "50% cheaper than tourist restaurants",
  },
  {
    icon: "money",
    title: "Money, Kasikorn ATM only",
    desc: "Lowest foreign card fees in Thailand. Superrich exchange booths on Silom give the best cash rates.",
    saving: "Saves $4 to $8 per withdrawal",
  },
];

export const recent = [
  { name: "Fake Parking Attendant Scam", dest: "Bali, Indonesia · Tanah Lot Temple", level: "High", time: "2h ago", tone: "danger" },
  { name: "Currency Shortchanging at Money Changers", dest: "Hanoi, Vietnam · Old Quarter", level: "Medium", time: "4h ago", tone: "warning" },
  { name: "Ben Thanh Market, Safe for Food", dest: "Ho Chi Minh City, Vietnam", level: "Tip", time: "6h ago", tone: "safe" },
  { name: "Bracelet Gifting Scam, New Reports", dest: "Rome, Italy · Trevi Fountain area", level: "High", time: "8h ago", tone: "danger" },
  { name: "ATM Skimming Device Found", dest: "Prague, Czech Republic · Old Town Square", level: "High", time: "12h ago", tone: "info" },
];

export const cities = [
  { flag: "🇹🇭", name: "Bangkok", score: "6.8", tone: "ok" },
  { flag: "🇮🇩", name: "Bali", score: "7.1", tone: "ok" },
  { flag: "🇻🇳", name: "Hanoi", score: "7.4", tone: "ok" },
  { flag: "🇯🇵", name: "Tokyo", score: "9.1", tone: "good" },
  { flag: "🇰🇭", name: "Siem Reap", score: "6.5", tone: "ok" },
  { flag: "🇮🇹", name: "Rome", score: "7.0", tone: "ok" },
  { flag: "🇪🇸", name: "Barcelona", score: "6.9", tone: "ok" },
  { flag: "🇲🇾", name: "Kuala Lumpur", score: "8.2", tone: "good" },
  { flag: "🇸🇬", name: "Singapore", score: "9.4", tone: "good" },
  { flag: "🇨🇿", name: "Prague", score: "7.3", tone: "ok" },
  { flag: "🇳🇵", name: "Kathmandu", score: "6.8", tone: "ok" },
  { flag: "🇱🇰", name: "Colombo", score: "7.0", tone: "ok" },
];