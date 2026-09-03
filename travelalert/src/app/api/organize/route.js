export async function POST(request) {
  const { city, posts } = await request.json();
  const key = process.env.GEMINI_API_KEY;

  if (!city) {
    return Response.json({ error: "city required", alerts: [] }, { status: 400 });
  }

  if (!key) {
    return Response.json(
      { error: "AI not configured", alerts: [] },
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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 },
      }),
    }
  );

  if (!res.ok) {
    return Response.json({ city, alerts: [], error: "gemini failed" });
  }

  const body = await res.json();
  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text || "";
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