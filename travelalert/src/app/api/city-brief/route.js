import { normalizeCity, resolveCity } from "@/lib/city";
import { getRequestProfile } from "@/lib/auth-server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCachedBrief, saveCachedBrief } from "@/lib/cache";

export const maxDuration = 15;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

function forecastType(code) {
  if (code == null) return "partly-cloudy";
  if (code <= 1) return "sun";
  if (code <= 3) return "partly-cloudy";
  if (code <= 82 || (code >= 85 && code <= 86)) return "rain";
  if (code >= 95) return "thunder";
  return "partly-cloudy";
}

function formatClock(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(iso || ""));
  if (!m) return null;
  let h = parseInt(m[4], 10);
  const min = m[5];
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${min} ${ampm}`;
}

function formatDaylight(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return null;
  const total = Math.round(Number(seconds) / 60);
  return `${Math.floor(total / 60)} h ${total % 60} m`;
}

function gmtOffset(timeZone) {
  if (!timeZone) return null;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    }).formatToParts(new Date());
    const raw = parts.find((p) => p.type === "timeZoneName")?.value || "";
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

/** True when a payload has enough data for the four dashboard cards to render. */
function isCompleteBrief(payload) {
  if (!payload || typeof payload !== "object") return false;
  if (payload.skipped) return false;
  const weatherOk =
    payload.weather && typeof payload.weather.temp === "number";
  const forecastOk =
    Array.isArray(payload.forecast) && payload.forecast.length > 0;
  return Boolean(weatherOk && forecastOk);
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
  let city = resolveCity(rawCity);
  if (!city) city = normalizeCity(rawCity);
  if (!city) {
    return Response.json(
      { error: `Could not recognize "${rawCity}" as a valid city name` },
      { status: 400 }
    );
  }

  // ── Cache lookup (1-hour TTL). Only return a cached payload if it has the
  //    full weather + forecast data the cards need. A partially-broken entry
  //    (e.g. cached before the "only cache complete payloads" guard landed)
  //    is discarded and replaced by a fresh fetch below.
  const cachedBrief = getCachedBrief(city);
  if (isCompleteBrief(cachedBrief)) {
    console.info("city-brief.source", { city, source: "cache" });
    return Response.json(cachedBrief);
  }

  console.info("city-brief.fetch", { city, source: "live" });

  // ── Geocoding
  let hit = null;
  try {
    const geoRes = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?count=1&name=" +
        encodeURIComponent(city)
    );
    const geo = await geoRes.json();
    hit = geo?.results?.[0] || null;
  } catch (err) {
    console.error("city-brief geocoding failed:", err?.message || err);
    hit = null;
  }

  if (!hit) {
    return Response.json({ error: "city not found" }, { status: 404 });
  }

  let code = null;
  let currencyName = null;
  const currency = currencyByCountry[hit.country_code];
  if (currency) [code, currencyName] = currency;

  // ── Weather + FX in parallel
  const [wxData, rateData] = await Promise.allSettled([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,uv_index,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,precipitation_probability_max,sunrise,sunset,daylight_duration` +
        `&forecast_days=7&timezone=auto`
    ).then((r) => (r.ok ? r.json() : null)),
    code
      ? fetch("https://open.er-api.com/v6/latest/USD").then((r) =>
          r.ok ? r.json() : null
        )
      : null,
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

  const money_avoid = "Skip airport desks — worst spread.";
  const money_best = "Bank ATM. Decline DCC.";
  const weather_headline = weather.condition || "Live conditions";
  const weather_note =
    weather.temp != null
      ? `${weather.temp}°C in ${hit.name} right now.`
      : "Live weather is temporarily unavailable.";

  const payload = {
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
  };

  // Only persist payloads that will render correctly on the next request.
  // A payload with a missing weather block (Open-Meteo down) or an empty
  // forecast array would poison every subsequent request for the next hour.
  if (isCompleteBrief(payload)) {
    saveCachedBrief(city, payload);
    console.info("city-brief.cached", { city, forecastDays: forecast.length });
  } else {
    console.info("city-brief.not_cached", {
      city,
      reason: "incomplete payload",
      weatherTemp: weather.temp,
      forecastDays: forecast.length,
    });
  }

  return Response.json(payload);
}