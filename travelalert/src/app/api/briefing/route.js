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
  if (
    cached &&
    (cached.alerts || []).length >= 12 &&
    (cached.tips || []).length >= 10
  ) {
    return Response.json({
      city,
      alerts: cached.alerts,
      tips: cached.tips,
      source: "cache",
      fetchedAt: cached.fetchedAt || null,
    });
  }

  const orgRes = await fetch(url.origin + "/api/organize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, posts: [] }),
    cache: "no-store",
  });
  const orgData = await orgRes.json();

  const payload = {
    city,
    alerts: orgData.alerts || [],
    tips: orgData.tips || [],
    fetchedAt: new Date().toISOString(),
  };

  if (payload.alerts.length >= 12 && payload.tips.length >= 10) {
    await saveCache(city, payload);
  }

  return Response.json({
    ...payload,
    source: orgData.source || "live",
    error: orgData.error,
  });
}