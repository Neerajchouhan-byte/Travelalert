const CURRENCY_BY_COUNTRY = {
  TH: "THB", ID: "IDR", VN: "VND", JP: "JPY", KH: "KHR",
  IT: "EUR", ES: "EUR", FR: "EUR", DE: "EUR", GR: "EUR",
  PT: "EUR", NL: "EUR", AT: "EUR", IE: "EUR",
  MY: "MYR", SG: "SGD", CZ: "CZK", NP: "NPR", LK: "LKR",
  IN: "INR", US: "USD", GB: "GBP", AU: "AUD", NZ: "NZD",
  AE: "AED", TR: "TRY", KR: "KRW", CN: "CNY", HK: "HKD",
  TW: "TWD", PH: "PHP", LA: "LAK", MM: "MMK", BD: "BDT",
  PK: "PKR", BR: "BRL", MX: "MXN", CA: "CAD", CH: "CHF",
  SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", HU: "HUF",
  RO: "RON", ZA: "ZAR", EG: "EGP", KE: "KES", MA: "MAD",
  PE: "PEN", AR: "ARS", CL: "CLP", CO: "COP",
};

async function getUsdRates() {
  try {
    const res = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json",
      { cache: "no-store" }
    );
    const json = await res.json();
    const usd = json?.usd;
    if (usd && typeof usd === "object") {
      const upper = {};
      for (const [k, v] of Object.entries(usd)) upper[k.toUpperCase()] = v;
      return upper;
    }
  } catch {}

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-store",
    });
    const json = await res.json();
    return json?.rates || {};
  } catch {
    return {};
  }
}

export async function GET(request) {
  const city =
    request.nextUrl?.searchParams.get("city") ||
    new URL(request.url).searchParams.get("city") ||
    "";

  if (city.length < 2) {
    return Response.json({ error: "city required" }, { status: 400 });
  }

  try {
    const geoRes = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?count=1&name=" +
        encodeURIComponent(city),
      { cache: "no-store" }
    );
    const geo = await geoRes.json();
    const hit = geo?.results?.[0];
    if (!hit) return Response.json({ error: "city not found" }, { status: 404 });

    let weather = { temp: null, feels: null, humidity: null, uv: null, code: 0 };
    try {
      const wxRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,uv_index`,
        { cache: "no-store" }
      );
      const wx = await wxRes.json();
      const cur = wx.current || {};
      weather = {
        temp: Math.round(cur.temperature_2m ?? 0),
        feels: Math.round(cur.apparent_temperature ?? 0),
        humidity: cur.relative_humidity_2m ?? null,
        uv: cur.uv_index ?? null,
        code: cur.weather_code ?? 0,
      };
    } catch {}

    const cc = String(hit.country_code || "").toUpperCase();
    const code = CURRENCY_BY_COUNTRY[cc] || "USD";

    const rates = await getUsdRates();
    const usd = rates[code] ?? (code === "USD" ? 1 : null);
    const inrUsd = rates.INR;
    const eurUsd = rates.EUR;
    const inr = usd != null && inrUsd ? usd / inrUsd : null;
    const eur = usd != null && eurUsd ? usd / eurUsd : null;

    let money_avoid = "Skip airport desks — worst spread.";
    let money_best = "Use a bank ATM. Decline dynamic currency conversion.";
    let weather_headline =
      weather.code >= 50 ? "Rain likely" : "Check heat and UV";
    let weather_note = `${weather.temp ?? "—"}°C in ${hit.name} right now.`;

    const key = process.env.GEMINI_API_KEY;
    if (key) {
      try {
        const prompt = `City: ${hit.name}, ${hit.country}
Currency ${code}. 1 USD = ${usd} ${code}.
Weather ${weather.temp}°C, feels ${weather.feels}, humidity ${weather.humidity}%, UV ${weather.uv}.
Return ONLY JSON:
{"money_avoid":"one sentence","money_best":"one sentence","weather_headline":"3-6 words","weather_note":"1-2 sentences"}`;

        const gRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );
        const text =
          (await gRes.json())?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const a = text.indexOf("{");
        const b = text.lastIndexOf("}");
        if (a >= 0 && b > a) {
          const p = JSON.parse(text.slice(a, b + 1));
          money_avoid = p.money_avoid || money_avoid;
          money_best = p.money_best || money_best;
          weather_headline = p.weather_headline || weather_headline;
          weather_note = p.weather_note || weather_note;
        }
      } catch {}
    }

    return Response.json({
      city: hit.name,
      country: hit.country,
      code,
      usd,
      inr,
      eur,
      weather,
      money_avoid,
      money_best,
      weather_headline,
      weather_note,
    });
  } catch (err) {
    return Response.json(
      { error: err.message || "city-brief failed" },
      { status: 500 }
    );
  }
}