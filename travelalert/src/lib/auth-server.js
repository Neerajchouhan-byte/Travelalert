import { createClient } from "@supabase/supabase-js";
import { adminDb } from "./supabase-admin";
import { getBillingState, publicSubscription } from "./billing";

export function isPaid(plan) {
  return ["annual", "trip_pass"].includes(plan);
}

export async function getRequestUser(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!url || !anon || !token) return null;

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: "Bearer " + token } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id) return null;
  return data.user;
}

export async function getRequestProfile(request) {
  const user = await getRequestUser(request);
  if (!user) return { user: null, plan: "free" };

  const admin = adminDb();
  const [profileResult, billing] = await Promise.all([
    admin
      .from("profiles")
      .select("plan, search_count, search_month, searched_cities")
      .eq("user_id", user.id)
      .maybeSingle(),
    getBillingState(user.id),
  ]);

  const profile = profileResult?.data || null;
  const published = publicSubscription(billing);

  // Billing is authoritative. Fall back to the legacy profile column only if
  // the billing tables were unreachable AND the profile says annual.
  let plan = published.plan;
  if (plan === "free" && profile?.plan === "annual" && !billing.subscription) {
    plan = "annual";
  }

  return {
    user,
    plan,
    search_count: profile?.search_count || 0,
    search_month: profile?.search_month || null,
    searched_cities: Array.isArray(profile?.searched_cities)
      ? profile.searched_cities
      : [],
  };
}

export function sliceForPlan(plan, alerts = [], tips = []) {
  if (isPaid(plan)) {
    return {
      alerts,
      tips,
      lockedAlerts: 0,
      lockedTips: 0,
    };
  }
  // Explorer (free): preview top 2 alerts and top 3 tips, lock the rest
  const visibleAlerts = Math.min(2, alerts.length);
  const visibleTips = Math.min(3, tips.length);
  return {
    alerts: alerts.slice(0, Math.max(2, visibleAlerts)),
    tips: tips.slice(0, Math.max(3, visibleTips)),
    lockedAlerts: Math.max(0, alerts.length - Math.max(2, visibleAlerts)),
    lockedTips: Math.max(0, tips.length - Math.max(3, visibleTips)),
  };
}