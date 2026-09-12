import { normalizeCity, resolveCity } from "@/lib/city";
import { getRequestProfile } from "@/lib/auth-server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getFreshCache } from "@/lib/cache";
import { FREE_SEARCH_LIMIT, computeUsedSearches } from "@/lib/quota";

export const maxDuration = 15;

// Minimums the reader (/api/briefing) requires before it treats a cached row
// as usable. Must match src/app/api/briefing/route.js.
const MIN_CACHED_ALERTS = 4;
const MIN_CACHED_TIPS = 3;

const currencyByCountry = {
  KH: ["KHR", "Cambodian Riel"],
  CZ: ["CZK", "Czech Koruna"],
  ID: ["IDR", "Indonesian Rupiah"],
  IT: ["EUR", "Euro"],
  JP: ["JPY", "Japanese Yen"],
  LK: ["LKR", "Sri Lankan Rupee"],
  MY: ["MYR", "Malaysian Ringgit"],
  NP: ["NPR", "Nepalese Rupee"],
  SG: ["SGD", "Singapore Dollar"],
  TH: ["THB", "Thai Baht"],
  VN: ["VND", "Vietnamese Dong"],
  US: ["USD", "US Dollar"],
  // Broader coverage so a fresh search for any major destination resolves
  // its currency instead of falling back to "Local Currency".
  AD: ["EUR", "Euro"], AT: ["EUR", "Euro"], BE: ["EUR", "Euro"],
  DE: ["EUR", "Euro"], EE: ["EUR", "Euro"], ES: ["EUR", "Euro"],
  FI: ["EUR", "Euro"], FR: ["EUR", "Euro"], GR: ["EUR", "Euro"],
  HR: ["EUR", "Euro"], IE: ["EUR", "Euro"], LT: ["EUR", "Euro"],
  LU: ["EUR", "Euro"], LV: ["EUR", "Euro"], MC: ["EUR", "Euro"],
  MT: ["EUR", "Euro"], NL: ["EUR", "Euro"], PT: ["EUR", "Euro"],
  SK: ["EUR", "Euro"], SI: ["EUR", "Euro"], SM: ["EUR", "Euro"],
  VA: ["EUR", "Euro"], ME: ["EUR", "Euro"], XK: ["EUR", "Euro"],
  GB: ["GBP", "British Pound"], IN: ["INR", "Indian Rupee"],
  CN: ["CNY", "Chinese Yuan"], KR: ["KRW", "South Korean Won"],
  KP: ["KPW", "North Korean Won"], HK: ["HKD", "Hong Kong Dollar"],
  TW: ["TWD", "New Taiwan Dollar"], MO: ["MOP", "Macanese Pataca"],
  AU: ["AUD", "Australian Dollar"], NZ: ["NZD", "New Zealand Dollar"],
  CA: ["CAD", "Canadian Dollar"], CH: ["CHF", "Swiss Franc"],
  MX: ["MXN", "Mexican Peso"], BR: ["BRL", "Brazilian Real"],
  AR: ["ARS", "Argentine Peso"], CL: ["CLP", "Chilean Peso"],
  PE: ["PEN", "Peruvian Sol"], CO: ["COP", "Colombian Peso"],
  UY: ["UYU", "Uruguayan Peso"], EC: ["USD", "US Dollar"],
  BO: ["BOB", "Bolivian Boliviano"], PY: ["PYG", "Paraguayan Guaraní"],
  VE: ["VES", "Venezuelan Bolívar"], CR: ["CRC", "Costa Rican Colón"],
  PA: ["USD", "US Dollar"], GT: ["GTQ", "Guatemalan Quetzal"],
  TR: ["TRY", "Turkish Lira"], GE: ["GEL", "Georgian Lari"],
  AM: ["AMD", "Armenian Dram"], AZ: ["AZN", "Azerbaijani Manat"],
  KZ: ["KZT", "Kazakhstani Tenge"], UZ: ["UZS", "Uzbekistani Som"],
  KG: ["KGS", "Kyrgyzstani Som"], MN: ["MNT", "Mongolian Tögrög"],
  AE: ["AED", "UAE Dirham"], SA: ["SAR", "Saudi Riyal"],
  QA: ["QAR", "Qatari Riyal"], KW: ["KWD", "Kuwaiti Dinar"],
  BH: ["BHD", "Bahraini Dinar"], OM: ["OMR", "Omani Rial"],
  IL: ["ILS", "Israeli Shekel"], JO: ["JOD", "Jordanian Dinar"],
  LB: ["LBP", "Lebanese Pound"], IQ: ["IQD", "Iraqi Dinar"],
  IR: ["IRR", "Iranian Rial"], EG: ["EGP", "Egyptian Pound"],
  MA: ["MAD", "Moroccan Dirham"], TN: ["TND", "Tunisian Dinar"],
  DZ: ["DZD", "Algerian Dinar"], ZA: ["ZAR", "South African Rand"],
  KE: ["KES", "Kenyan Shilling"], TZ: ["TZS", "Tanzanian Shilling"],
  UG: ["UGX", "Ugandan Shilling"], ET: ["ETB", "Ethiopian Birr"],
  NG: ["NGN", "Nigerian Naira"], GH: ["GHS", "Ghanaian Cedi"],
  SN: ["XOF", "West African CFA Franc"], CI: ["XOF", "West African CFA Franc"],
  CM: ["XAF", "Central African CFA Franc"], MU: ["MUR", "Mauritian Rupee"],
  MV: ["MVR", "Maldivian Rufiyaa"], BD: ["BDT", "Bangladeshi Taka"],
  PK: ["PKR", "Pakistani Rupee"], BT: ["BTN", "Bhutanese Ngultrum"],
  MM: ["MMK", "Myanmar Kyat"], LA: ["LAK", "Lao Kip"],
  BN: ["BND", "Brunei Dollar"], PH: ["PHP", "Philippine Peso"],
  FJ: ["FJD", "Fijian Dollar"], IS: ["ISK", "Icelandic Króna"],
  NO: ["NOK", "Norwegian Krone"], SE: ["SEK", "Swedish Krona"],
  DK: ["DKK", "Danish Krone"], PL: ["PLN", "Polish Złoty"],
  HU: ["HUF", "Hungarian Forint"], RO: ["RON", "Romanian Leu"],
  BG: ["BGN", "Bulgarian Lev"], RS: ["RSD", "Serbian Dinar"],
  AL: ["ALL", "Albanian Lek"], MK: ["MKD", "Macedonian Denar"],
  BA: ["BAM", "Bosnian Convertible Mark"], MD: ["MDL", "Moldovan Leu"],
  UA: ["UAH", "Ukrainian Hryvnia"], BY: ["BYN", "Belarusian Ruble"],
  RU: ["RUB", "Russian Ruble"],
};

/** Human label for a WMO weather code. */
function conditionLabel(code) {
  if (code == null) return null;
  if (code === 0) return "Clear";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}

/** Map a WMO code to one of the WeatherCard icon types. */
function forecastType(code) {
  if (code == null) return "partly-cloudy";
  if (code <= 1) return "sun";
  if (code <= 3) return "partly-cloudy";
  if (code <= 82 || (code >= 85 && code <= 86)) return "rain";
  if (code >= 95) return "thunder";
  return "partly-cloudy";
}

/** "2026-09-07T06:12" → "6:12 am" (input is location-local). */
function formatClock(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(iso || ""));
  if (!m) return null;
  let h = parseInt(m[4], 10);
  const min = m[5];
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${min} ${ampm}`;
}

/** Seconds → "15 h 32 m". */
function formatDaylight(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return null;
  const total = Math.round(Number(seconds) / 60);
  return `${Math.floor(total / 60)} h ${total % 60} m`;
}

/** Convert an IANA timezone (e.g. "Asia/Kolkata") into a "GMT+5:30" string. */
function gmtOffset(timeZone) {
  if (!timeZone) return null;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    }).formatToParts(new Date());
    const raw =
      parts.find((p) => p.type === "timeZoneName")?.value || "";
    const m = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(raw);
    if (!m) return null;
    const sign = m[1] === "-" ? "-" : "+";
    const hh = parseInt(m[2], 10);
    const mm = m[3] ? parseInt(m[3], 10) : 0;
    return mm ? `GMT${sign}${hh}:${String(mm).padStart(2, "0")}` : `GMT${sign}${hh}`;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const profile = await getRequestProfile(request);
  if (!profile.user) {
    return Response.json({ error: "sign in required" }, { status: 401 });
  }

  const limit = checkRateLimit(`city-brief:${profile.user.id}`, 60);
  if (!limit.ok) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const rawCity = request.nextUrl.searchParams.get("city") || "";

  // Try to resolve city using fuzzy matching first
  let city = resolveCity(rawCity);

  // Fallback to simple normalization
  if (!city) {
    city = normalizeCity(rawCity);
  }

  if (!city) {
    return Response.json(
      { error: `Could not recognize "${rawCity}" as a valid city name` },
      { status: 400 }
    );
  }

  // ── Server-side quota + cache gate ─────────────────────────────────────
  //
  // The dashboard fires /api/briefing and /api/city-brief in parallel on
  // every city change. When the user is a free-plan user who has used all
  // FREE_SEARCH_LIMIT searches for the current month AND the destination has
  // no usable cache row, /api/briefing returns 403 (limitReached) and the UI
  // shows the upgrade modal — the user will never see this city's intel.
  //
  // Without this gate, /api/city-brief would still make three external HTTP
  // calls (geocoding, weather, FX) for a destination whose data the user
  // cannot view. This check runs before any fetch, so the client cannot
  // bypass it: even a hand-crafted request from a quota-exhausted session
  // gets { skipped: true } and zero external traffic.
  //
  // Paid users (plan !== "free") are never gated here.
  const usedSearches = computeUsedSearches(profile);
  const hasAccess = profile.plan !== "free";
  const overQuota = !hasAccess && usedSearches >= FREE_SEARCH_LIMIT;

  if (overQuota) {
    const cached = await getFreshCache(city);
    const cacheUsable =
      cached &&
      (cached.alerts || []).length >= MIN_CACHED_ALERTS &&
      (cached.tips || []).length >= MIN_CACHED_TIPS;

    if (!cacheUsable) {
      console.info("city-brief.skipped", {
        city,
        reason: "quota-exhausted-uncached",
        usedSearches,
      });
      return Response.json({
        skipped: true,
        reason: "quota-exhausted-uncached",
        city,
      });
    }
  }
  // ───────────────────────────────────────────────────────────────────────

  let hit = null;
  try {
    const geoRes = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?count=1&name=" +
        encodeURIComponent(city)
    );
    const geo = await geoRes.json();
    hit = geo?.results?.[0] || null;
  } catch {
    hit = null;
  }

  if (!hit) {
    return Response.json({ error: "city not found" }, { status: 404 });
  }

  let code = null;
  let currencyName = null;
  const currency = currencyByCountry[hit.country_code];
  if (currency) [code, currencyName] = currency;

  // Run weather and currency API calls in parallel for faster response
  const [wxData, rateData] = await Promise.allSettled([
    // Fetch weather data
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,uv_index,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,precipitation_probability_max,sunrise,sunset,daylight_duration` +
        `&forecast_days=7&timezone=auto`
    ).then(r => r.ok ? r.json() : null),
    // Fetch exchange rates
    code ? fetch("https://open.er-api.com/v6/latest/USD").then(r => r.ok ? r.json() : null) : null
  ]);

  const wx = wxData.status === "fulfilled" ? wxData.value : null;
  const cur = wx?.current || null;

  let usd = null;
  let inr = null;
  let eur = null;
  if (rateData.status === "fulfilled" && rateData.value) {
    const rates = rateData.value?.rates || {};
    usd = rates[code] ?? null;
    inr = usd != null && rates.INR ? usd / rates.INR : null;
    eur = usd != null && rates.EUR ? usd / rates.EUR : null;
  }

  const daily = wx?.daily || null;
  const weather = {
    temp: cur?.temperature_2m != null ? Math.round(cur.temperature_2m) : null,
    feels:
      cur?.apparent_temperature != null
        ? Math.round(cur.apparent_temperature)
        : null,
    humidity: cur?.relative_humidity_2m ?? null,
    uv: cur?.uv_index ?? null,
    code: cur?.weather_code ?? null,
    condition: conditionLabel(cur?.weather_code),
    wind_kph:
      cur?.wind_speed_10m != null ? Math.round(cur.wind_speed_10m) : null,
    rain_chance: daily?.precipitation_probability_max?.[0] ?? null,
    sunrise: daily?.sunrise?.[0] ? formatClock(daily.sunrise[0]) : null,
    sunset: daily?.sunset?.[0] ? formatClock(daily.sunset[0]) : null,
    daylight:
      daily?.daylight_duration?.[0] != null
        ? formatDaylight(daily.daylight_duration[0])
        : null,
  };

  // 7-day forecast pills for the WeatherCard (Today first).
  const forecast = (daily?.time || [])
    .slice(0, 7)
    .map((day, i) => {
      const maxTemp = daily.temperature_2m_max?.[i];
      return {
        day:
          i === 0
            ? "Today"
            : new Date(`${day}T12:00:00`).toLocaleDateString("en-US", {
                weekday: "short",
              }),
        temp: maxTemp != null ? Math.round(maxTemp) : null,
        type: forecastType(daily.weather_code?.[i]),
      };
    })
    .filter((f) => f.temp != null);

  // Static responses for money and weather advice (no AI call needed)
  const money_avoid = "Skip airport desks — worst spread.";
  const money_best = "Bank ATM. Decline DCC.";
  const weather_headline = weather.condition || "Live conditions";
  const weather_note = weather.temp != null
    ? `${weather.temp}°C in ${hit.name} right now.`
    : "Live weather is temporarily unavailable.";

  return Response.json({
    city: hit.name,
    country: hit.country,
    country_code: hit.country_code || null,
    tz: gmtOffset(hit.timezone),
    code,
    usd,
    inr,
    eur,
    weather,
    forecast,
    money_avoid,
    money_best,
    weather_headline,
    weather_note,
    currencyName,
  });
}