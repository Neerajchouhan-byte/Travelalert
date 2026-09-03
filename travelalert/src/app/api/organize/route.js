export async function POST(request) {
  const { city, posts } = await request.json();
  const key = process.env.GEMINI_API_KEY;

  if (!city) {
    return Response.json({ error: "city required", alerts: [] }, { status: 400 });
  }

  if (!key) {
    return Response.json(
      { error: "AI not configured — add GEMINI_API_KEY to .env.local then restart", alerts: [] },
      { status: 503 }
    );
  }

  const digest = (posts || [])
    .slice(0, 8)
    .map((p, i) => `${i + 1}. r/${p.sub}: ${p.title}\n${p.text}`)
    .join("\n\n")
    .slice(0, 3500);

    const prompt = `City: ${city}
From these Reddit posts, extract scams AND local tips for THIS city only.
Never mention a different city. If the posts are thin, use common traveler knowledge for ${city}.

Return ONLY valid JSON, no markdown:
{
  "alerts":[{"name":"","severity":"high","description":"","avoid":""}],
  "tips":[{"name":"","description":"","avoid":""}]
}

Rules:
- alerts: 3 to 6 items, severity high or medium, about ${city} only
- tips: exactly 3 items, useful local advice for ${city} (transport, food, money)
- every name/description/avoid must include or clearly be about ${city}

Posts:
${digest || "(no posts — invent common tourist scams and tips for " + city + ")"}`;

  const models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"];

  let lastError = "";
  let text = "";

  for (const model of models) {
              const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=" +
        key,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 },
        }),
      }
    );

    const body = await res.json();

    if (!res.ok) {
      lastError =
        body?.error?.message ||
        `HTTP ${res.status} on ${model}`;
      continue;
    }

    text = body?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (text) break;
    lastError = `empty response from ${model}`;
  }

  if (!text) {
    return Response.json({
      city,
      alerts: [],
      error: lastError || "gemini failed",
    });
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  let alerts = [];
  try {
    if (start >= 0 && end > start) {
      const parsed = JSON.parse(text.slice(start, end + 1));
      alerts = Array.isArray(parsed.alerts) ? parsed.alerts : [];
    }
  } catch {
    alerts = [];
  }

  alerts = alerts
    .filter((a) => a && a.name)
    .slice(0, 6)
    .map((a) => ({
      name: String(a.name),
      severity: ["high", "medium", "tip"].includes(a.severity)
        ? a.severity
        : "medium",
      description: String(a.description || ""),
      avoid: String(a.avoid || ""),
    }));
      let tips = [];
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    tips = Array.isArray(parsed.tips) ? parsed.tips : [];
  } catch {
    tips = [];
  }

  tips = tips
    .filter((t) => t && (t.name || t.title))
    .slice(0, 3)
    .map((t) => ({
      name: String(t.name || t.title),
      description: String(t.description || t.desc || ""),
      avoid: String(t.avoid || t.saving || ""),
    }));

  return Response.json({ city, alerts, tips });
}