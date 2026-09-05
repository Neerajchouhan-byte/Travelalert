import { getFreshCache, saveCache } from "@/lib/cache";
import { organizeCity } from "@/lib/organize";
import { normalizeCity } from "@/lib/city";
import { getRequestProfile, sliceForPlan, isPaid } from "@/lib/auth-server";
import { adminDb } from "@/lib/supabase-admin";

export const maxDuration = 60;

function monthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function GET(request) {
  const profile = await getRequestProfile(request);
  if (!profile.user) {
    return Response.json({ error: "sign in required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const city = normalizeCity(url.searchParams.get("city") || "");
  if (!city) {
    return Response.json(
      { error: "valid city required", alerts: [], tips: [] },
      { status: 400 }
    );
  }

  const month = monthKey();
  let count = profile.search_count || 0;
  if (profile.search_month !== month) count = 0;

  if (!isPaid(profile.plan) && count >= 3) {
    return Response.json(
      {
        error: "Free plan allows 3 destination searches per month. Upgrade for unlimited.",
        city,
        alerts: [],
        tips: [],
        plan: profile.plan,
        searchesLeft: 0,
      },
      { status: 402 }
    );
  }

  let payload;
  const cached = await getFreshCache(city);
  if (
    cached &&
    (cached.alerts || []).length >= 8 &&
    (cached.tips || []).length >= 6
  ) {
    payload = {
      city,
      alerts: cached.alerts,
      tips: cached.tips,
      source: "cache",
      fetchedAt: cached.fetchedAt || null,
    };
  } else {
    const org = await organizeCity(city);
    payload = {
      city,
      alerts: org.alerts || [],
      tips: org.tips || [],
      source: org.source || "live",
      fetchedAt: new Date().toISOString(),
      error: org.error,
    };
    if (payload.alerts.length >= 8 && payload.tips.length >= 6) {
      await saveCache(city, payload);
    }
  }

  await adminDb()
    .from("profiles")
    .update({
      search_count: count + 1,
      search_month: month,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", profile.user.id);

  const sliced = sliceForPlan(profile.plan, payload.alerts, payload.tips);

  return Response.json({
    city: payload.city,
    alerts: sliced.alerts,
    tips: sliced.tips,
    lockedAlerts: sliced.lockedAlerts,
    lockedTips: sliced.lockedTips,
    source: payload.source,
    fetchedAt: payload.fetchedAt,
    error: payload.error,
    plan: profile.plan,
    searchesLeft: isPaid(profile.plan) ? null : Math.max(0, 3 - (count + 1)),
  });
}