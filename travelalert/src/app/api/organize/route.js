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
From these Reddit posts, extract up to 6 tourist scams or useful tips.
Return ONLY valid JSON, no markdown, in this shape:
{"alerts":[{"name":"","severity":"high","description":"","avoid":""}]}

severity must be one of: high, medium, tip

Posts:
${digest || "(no posts — invent 3 common tourist scams for this city based on typical traveler reports)"}`;

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

  return Response.json({ city, alerts });
}