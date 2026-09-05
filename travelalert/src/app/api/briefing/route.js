import { getFreshCache, saveCache } from "@/lib/cache";

export async function GET(request) {
  const url = new URL(request.url);
  const city = (url.searchParams.get("city") || "").trim();

  if (city.length < 2) {
    return Response.json(
      { error: "city required", alerts: [], tips: [] },
      { status: 400 }
    );
  }

  const cached = await getFreshCache(city);
  if (cached && Array.isArray(cached.alerts)) {
    return Response.json({
      city,
      alerts: cached.alerts || [],
      tips: cached.tips || [],
      source: "cache",
      fetchedAt: cached.fetchedAt || null,
    });
  }
  // Reddit — call Reddit directly, not /api/reddit
  let posts = [];
  try {
    const q = encodeURIComponent(
      `${city} (scam OR tourist OR taxi OR overcharg)`
    );
    const redditUrl = `https://www.reddit.com/search.json?q=${q}&sort=new&t=month&limit=12&raw_json=1`;
    const redditRes = await fetch(redditUrl, {
      headers: {
        "User-Agent": "TravelRadar/1.0 (travel safety)",
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (redditRes.ok) {
      const json = await redditRes.json();
      posts = (json?.data?.children || []).map((c) => ({
        title: c.data?.title || "",
        text: (c.data?.selftext || "").slice(0, 400),
        sub: c.data?.subreddit || "travel",
        score: c.data?.score || 0,
      }));
    }
  } catch {
    posts = [];
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return Response.json(
      {
        city,
        alerts: [],
        tips: [],
        source: "reddit",
        fetchedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  try {
    const prompt = `Create a concise travel safety briefing for ${city} using the Reddit posts below. Return only valid JSON in the form {"alerts":[],"tips":[]}. Do not invent facts.\n${JSON.stringify(posts)}`;
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        cache: "no-store",
      }
    );

    if (!geminiRes.ok) throw new Error("Gemini request failed");
    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const briefing = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
    const result = {
      city,
      alerts: Array.isArray(briefing.alerts) ? briefing.alerts : [],
      tips: Array.isArray(briefing.tips) ? briefing.tips : [],
      source: "gemini",
      fetchedAt: new Date().toISOString(),
    };

    await saveCache(city, result);
    return Response.json(result);
  } catch {
    return Response.json({
      city,
      alerts: [],
      tips: [],
      source: "reddit",
      fetchedAt: new Date().toISOString(),
    });
  }
}