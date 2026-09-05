import { fetchLivePosts } from "@/lib/live-posts";

function cleanList(arr, n) {
  return (arr || [])
    .filter((x) => x && (x.name || x.title))
    .slice(0, n)
    .map((x) => ({
      name: String(x.name || x.title),
      severity: ["high", "medium", "tip"].includes(x.severity)
        ? x.severity
        : "medium",
      description: String(x.description || x.desc || ""),
      avoid: String(x.avoid || x.saving || ""),
    }));
}
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

async function askGemini(key, prompt) {
  let lastErr = "no model tried";

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      lastErr = `${model} ${res.status} ${json?.error?.message || ""}`;
      continue;
    }

    const text =
      json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) {
      lastErr = `${model} returned no JSON`;
      continue;
    }

    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      lastErr = `${model} JSON parse failed`;
    }
  }

  throw new Error(lastErr);
}

export async function POST(request) {
  const { city = "", posts: inputPosts = [] } = await request.json().catch(() => ({}));
  let posts = Array.isArray(inputPosts) ? inputPosts : [];
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return Response.json(
      {
        error: "GEMINI_API_KEY missing on the server",
        city,
        alerts: [],
        tips: [],
      },
      { status: 503 }
    );
  }

  if (posts.length < 5) {
    const live = await fetchLivePosts(city);
    if (live.posts.length > posts.length) posts = live.posts;
  }

  const digest = posts
    .slice(0, 15)
    .map(
      (p, i) =>
        `${i + 1}. r/${p.sub || "travel"}: ${p.title}\n${p.text || ""}`
    )
    .join("\n\n")
    .slice(0, 5000);

  const prompt = `You are building a live travel-safety briefing for "${city}".

Use:
1) the traveler posts below (if any)
2) Google Search for recent "${city} tourist scam", "${city} taxi scam", "${city} ATM", "${city} tourist trap" reports

Return ONLY JSON (no markdown):
{
  "alerts":[{"name":"","severity":"high","description":"","avoid":""}],
  "tips":[{"name":"","description":"","avoid":""}]
}

Hard rules:
- exactly 12 alerts, severity "high" or "medium"
- exactly 10 tips
- every item must be about ${city} only
- prefer incidents from the last 24 months
- description = what happens (1-2 sentences)
- avoid = what the traveler should do
- do not return empty arrays

Posts:
${digest || "(no posts — search the web for current traveler reports)"}`;

  try {
    const parsed = await askGemini(key, prompt);
    let alerts = cleanList(parsed.alerts, 12);
    let tips = cleanList(parsed.tips, 10);

    if (alerts.length < 12 || tips.length < 10) {
      const fill = await askGemini(
        key,
        `Expand this ${city} briefing to EXACTLY 12 alerts and 10 tips.
Keep existing items. Add more current ${city} tourist risks and tips from web reports.
Return ONLY JSON: {"alerts":[...],"tips":[...]}

Current:
${JSON.stringify({ alerts, tips })}`
      );
      alerts = cleanList([...(alerts || []), ...(fill.alerts || [])], 12);
      tips = cleanList([...(tips || []), ...(fill.tips || [])], 10);
    }

    return Response.json({
      city,
      alerts,
      tips,
      postCount: posts.length,
      source: posts.length ? "reddit+gemini" : "gemini-search",
    });
  } catch (err) {
  return Response.json(
    {
      city,
      alerts: [],
      tips: [],
      error: err.message || "organize failed",
    },
    { status: 500 }
  );
}
}