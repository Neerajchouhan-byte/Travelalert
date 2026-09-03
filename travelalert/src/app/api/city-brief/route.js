export async function GET(request) {
  const city = request.nextUrl.searchParams.get("city") || "";
  if (city.length < 2) {
    return Response.json({ error: "city required" }, { status: 400 });
  }

  const geoRes = await fetch(
    "https://geocoding-api.open-meteo.com/v1/search?count=1&name=" +
      encodeURIComponent(city)
  );
  const geo = await geoRes.json();
  const hit = geo?.results?.[0];
  if (!hit) return Response.json({ error: "city not found" }, { status: 404 });

  const wxRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,uv_index`
  );
  const wx = await wxRes.json();
  const cur = wx.current || {};

  let code = "USD";
  let currencyName = "US Dollar";
  try {
    const cr = await fetch(
      `https://restcountries.com/v3.1/alpha/${hit.country_code}?fields=currencies`
    );
    const cj = await cr.json();
    const keys = Object.keys(cj?.currencies || {});
    if (keys[0]) {
      code = keys[0];
      currencyName = cj.currencies[code]?.name || code;
    }
  } catch {}

  let usd = null;
  let inr = null;
  let eur = null;
  try {
    const rr = await fetch("https://open.er-api.com/v6/latest/USD");
    const rates = (await rr.json())?.rates || {};
    usd = rates[code] ?? null;
    inr = usd != null && rates.INR ? usd / rates.INR : null;
    eur = usd != null && rates.EUR ? usd / rates.EUR : null;
  } catch {}

  const weather = {
    temp: Math.round(cur.temperature_2m ?? 0),
    feels: Math.round(cur.apparent_temperature ?? 0),
    humidity: cur.relative_humidity_2m ?? null,
    uv: cur.uv_index ?? null,
    code: cur.weather_code ?? 0,
  };

  let money_avoid = "Skip airport desks — worst spread.";
  let money_best = "Bank ATM. Decline DCC.";
  let weather_headline = weather.code >= 50 ? "Rain likely" : "Pack for the heat";
  let weather_note = `${weather.temp}°C in ${hit.name} right now.`;

  const key = process.env.GEMINI_API_KEY;
  if (key) {
    const prompt = `City: ${hit.name}, ${hit.country}
Currency: ${currencyName} (${code}). 1 USD = ${usd} ${code}.
Weather: ${weather.temp}°C, feels ${weather.feels}, humidity ${weather.humidity}%, UV ${weather.uv}, code ${weather.code}.
Return ONLY JSON:
{"money_avoid":"one sentence","money_best":"one sentence","weather_headline":"3-6 words","weather_note":"1-2 sentences"}`;

    try {
      const gRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
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
}