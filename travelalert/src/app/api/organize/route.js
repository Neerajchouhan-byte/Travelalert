import { fetchLivePosts } from "@/lib/live-posts";

export const maxDuration = 60;

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

async function askGemini(key, prompt) {
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    model +
    ":generateContent";

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
    throw new Error(
      model + " " + res.status + " " + (json?.error?.message || "")
    );
  }

  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error(model + " returned no JSON");
  }
  return JSON.parse(text.slice(start, end + 1));
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const city = (body.city || "").trim();
  let posts = Array.isArray(body.posts) ? body.posts : [];

  if (city.length < 2) {
    return Response.json(
      { error: "city required", alerts: [], tips: [] },
      { status: 400 }
    );
  }

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

Use the traveler posts below if any exist.
Also use well-known recent tourist risks and tips for ${city}.

Return ONLY JSON (no markdown):
{
  "alerts":[{"name":"","severity":"high","description":"","avoid":""}],
  "tips":[{"name":"","description":"","avoid":""}]
}

Hard rules:
- exactly 12 alerts, severity "high" or "medium"
- exactly 10 tips
- every item must be about ${city} only
- description = what happens (1-2 sentences)
- avoid = what the traveler should do
- do not return empty arrays

Posts:
${digest || "(no posts)"}`;

  try {
    const parsed = await askGemini(key, prompt);
    const alerts = cleanList(parsed.alerts, 12);
    const tips = cleanList(parsed.tips, 10);

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