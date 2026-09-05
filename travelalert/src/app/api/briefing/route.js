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
  if (cached && Array.isArray(cached.alerts) && cached.alerts.length > 0) {
    return Response.json({
      city,
      alerts: cached.alerts,
      tips: cached.tips || [],
      source: "cache",
      fetchedAt: cached.fetchedAt || null,
    });
  }

  const origin = url.origin;

  let posts = [];
  try {
    const redditRes = await fetch(
      origin + "/api/reddit?city=" + encodeURIComponent(city),
      { cache: "no-store" }
    );
    const redditData = await redditRes.json();
    posts = redditData.posts || [];
  } catch {
    posts = [];
  }

  let alerts = [];
  let tips = [];
  let organizeError = "";

  try {
    const orgRes = await fetch(origin + "/api/organize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, posts }),
      cache: "no-store",
    });
    const orgData = await orgRes.json();
    const all = orgData.alerts || [];
    alerts = all.filter((a) => a && a.name && a.severity !== "tip");
    tips = orgData.tips?.length
      ? orgData.tips
      : all.filter((a) => a.severity === "tip");
    if (orgData.error && alerts.length === 0) {
      organizeError = orgData.error;
    }
  } catch {
    organizeError = "Could not organize reports";
  }

  const payload = {
    city,
    alerts,
    tips,
    fetchedAt: new Date().toISOString(),
  };

  if (alerts.length > 0) {
    await saveCache(city, payload);
  }

  return Response.json({
    ...payload,
    source: "live",
    error: organizeError || undefined,
  });
}