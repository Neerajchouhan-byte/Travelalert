import { createClient } from "@supabase/supabase-js";
import { adminDb } from "./supabase-admin";

export function isPaid(plan) {
  return plan === "pro" || plan === "lifetime";
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
  const { data } = await admin
    .from("profiles")
    .select("plan, search_count, search_month")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    user,
    plan: data?.plan || "free",
    search_count: data?.search_count || 0,
    search_month: data?.search_month || null,
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
  return {
    alerts: alerts.slice(0, 2),
    tips: tips.slice(0, 3),
    lockedAlerts: Math.max(0, alerts.length - 2),
    lockedTips: Math.max(0, tips.length - 3),
  };
}