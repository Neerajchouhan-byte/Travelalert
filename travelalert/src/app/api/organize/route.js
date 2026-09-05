const FALLBACK = {
  bangkok: [
    {
      name: "Tuk-tuk free temple tour",
      severity: "high",
      description:
        "Near the Grand Palace a driver offers a 'free' city tour, then pressures you into gem or tailor shops.",
      avoid: "Refuse free tours. Use Grab. Walk away from gem-shop detours.",
    },
    {
      name: "Airport taxi no meter",
      severity: "high",
      description:
        "Drivers at Suvarnabhumi quote 800–1200 THB for a ride that should be ~280–400 THB on Grab.",
      avoid: "Book Grab before leaving arrivals. Ignore touts inside the hall.",
    },
    {
      name: "Pad Thai tourist-price stall",
      severity: "medium",
      description:
        "Stalls on Khao San and some river piers charge 3–4× local prices for the same plate.",
      avoid: "Walk one street off the main strip. Check posted prices first.",
    },
  ],
  bali: [
    {
      name: "Motorbike damage claim",
      severity: "high",
      description:
        "Rental shops invent scratches on return and demand $100–200 cash.",
      avoid: "Photo every panel before you leave. Use a known shop, not the airport curb.",
    },
    {
      name: "Fake parking ticket",
      severity: "medium",
      description:
        "Someone in a vest 'helps' you park and later demands a fine.",
      avoid: "Park in official lots. Don't hand over the key or cash in the street.",
    },
  ],
  rome: [
    {
      name: "Bracelet gift scam",
      severity: "medium",
      description:
        "Near Trevi or the Colosseum someone ties a bracelet on your wrist, then demands payment.",
      avoid: "Hands in pockets. Say no and keep walking. Don't stop.",
    },
    {
      name: "Petition / friendship bracelet crowd",
      severity: "medium",
      description:
        "Groups block you with a petition or roses, then ask for a donation.",
      avoid: "Don't take objects. Don't sign. Move through as a group.",
    },
  ],
  prague: [
    {
      name: "ATM skimming near Old Town",
      severity: "high",
      description:
        "Standalone ATMs around Old Town Square are a common skimming target.",
      avoid: "Use an ATM inside a bank branch. Cover the keypad.",
    },
  ],
  hanoi: [
    {
      name: "Taxi no meter",
      severity: "medium",
      description:
        "Airport and Old Quarter taxis claim the meter is broken and quote 3–5× Grab.",
      avoid: "Use Grab or a marked company taxi. Agree the app price first.",
    },
  ],
};

function fallbackAlerts(city) {
  const key = city.trim().toLowerCase();
  const hit = Object.keys(FALLBACK).find((k) => key.includes(k));
  const base = hit
    ? FALLBACK[hit]
    : [
        {
          name: `Tourist-price transport in ${city}`,
          severity: "medium",
          description: `Unmetered taxis and unofficial transfers are the most common loss in ${city}.`,
          avoid: `Use a local ride app. Agree the price before you get in.`,
        },
        {
          name: `Card and ATM risk in ${city}`,
          severity: "medium",
          description: `Standalone tourist-area ATMs and dynamic currency conversion add hidden fees.`,
          avoid: `Bank-branch ATMs only. Decline DCC. Pay in local currency.`,
        },
      ];
  return base.map((a) => ({ ...a }));
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const city = (body.city || "").trim();
  const posts = Array.isArray(body.posts) ? body.posts : [];

  if (city.length < 2) {
    return Response.json({ error: "city required", alerts: [], tips: [] }, { status: 400 });
  }

  const seeded = fallbackAlerts(city);
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return Response.json({
      city,
      alerts: seeded,
      tips: [],
      source: "fallback",
    });
  }

  const digest = posts
    .slice(0, 8)
    .map((p, i) => `${i + 1}. r/${p.sub || "travel"}: ${p.title}\n${p.text || ""}`)
    .join("\n\n")
    .slice(0, 3500);

  const prompt = `City: ${city}
From these Reddit posts, extract scams AND local tips for THIS city only.
If posts are empty, use well-known tourist risks for ${city}.
Return ONLY JSON:
{"alerts":[{"name":"","severity":"high","description":"","avoid":""}],"tips":[{"name":"","description":"","avoid":""}]}
Rules:
- 3 to 6 alerts, severity high or medium
- 3 tips
- every item must be about ${city}

Posts:
${digest || "(no posts)"}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const bodyJson = await res.json();
    const text = bodyJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    let alerts = [];
    let tips = [];
    if (start >= 0 && end > start) {
      const parsed = JSON.parse(text.slice(start, end + 1));
      alerts = Array.isArray(parsed.alerts) ? parsed.alerts : [];
      tips = Array.isArray(parsed.tips) ? parsed.tips : [];
    }

    alerts = alerts
      .filter((a) => a && a.name)
      .slice(0, 6)
      .map((a) => ({
        name: String(a.name),
        severity: ["high", "medium", "tip"].includes(a.severity) ? a.severity : "medium",
        description: String(a.description || ""),
        avoid: String(a.avoid || ""),
      }));

    if (!alerts.length) alerts = seeded;

    return Response.json({ city, alerts, tips, source: "gemini" });
  } catch {
    return Response.json({ city, alerts: seeded, tips: [], source: "fallback" });
  }
}