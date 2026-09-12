import { getRequestProfile, sliceForPlan } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import { getFreshCache } from "@/lib/cache";
import { findKnownCity } from "@/lib/dashboard-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function esc(v) {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// GET /api/trips/[id]/export?format=email|print|pocket
// Export is Trip Pass / Annual only. No new dependency:
// print = print-ready HTML (Save as PDF), email = subject + text (mailto:),
// pocket = 1-page airport card HTML (Save as PDF).
export async function GET(request, { params }) {
  const profile = await getRequestProfile(request);
  if (!profile.user) return Response.json({ error: "sign in required" }, { status: 401 });
  const { id } = await params;
  let billingState = { subscription: null, tripPass: null };
  try {
    billingState = await getBillingState(profile.user.id);
  } catch (e) {
    console.error("[TripExport] billing failed:", e?.message || e);
  }
  if (!hasBillingAccess(billingState)) {
    return Response.json({ error: "Export is Trip Pass / Annual only.", upgradeRequired: true, plan: "free" }, { status: 403 });
  }
  const plan = billingState.subscription?.plan_key === "annual" ? "annual" : "trip_pass";
  const format = (new URL(request.url).searchParams.get("format") || "email").toLowerCase();
  const admin = adminDb();
  const { data: trip } = await admin.from("trips").select("id, name").eq("id", id).eq("user_id", profile.user.id).maybeSingle();
  if (!trip) return Response.json({ error: "Trip not found" }, { status: 404 });
  const { data: dests } = await admin.from("trip_destinations").select("city, visit_date").eq("trip_id", id).order("order_index");
  const sections = [];
  for (const stop of dests || []) {
    const cached = await getFreshCache(stop.city);
    const ok = cached && (cached.alerts || []).length >= 4 && (cached.tips || []).length >= 3;
    const s = sliceForPlan(plan, ok ? cached.alerts : [], ok ? cached.tips : []);
    sections.push({ city: stop.city, visit_date: stop.visit_date, alerts: s.alerts, tips: s.tips });
  }
  const day = new Date().toISOString().slice(0, 10);
  const subject = `TravelRadar Trip Briefing: ${trip.name} (${day})`;
  if (format === "pocket") {
    const html = buildPocketHtml(trip, day, sections, id);
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  if (format === "print") {
    const html = buildPrintHtml(subject, day, sections);
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  return Response.json({ subject, body: buildTextBody(trip, day, sections), plan });
}

function buildTextBody(trip, day, sections) {
  const lines = [`${trip.name} — ${sections.length} stops (${day})`, ""];
  sections.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.city}${s.visit_date ? " — " + s.visit_date : ""}`);
    lines.push(`   ALERTS (${s.alerts.length}):`);
    if (!s.alerts.length) lines.push("   - No cached intel yet.");
    for (const a of s.alerts) lines.push(`   - ${a.name} [${a.severity || "medium"}]: ${a.description || ""}`);
    lines.push(`   TIPS (${s.tips.length}):`);
    if (!s.tips.length) lines.push("   - No cached tips yet.");
    for (const t of s.tips) lines.push(`   - ${t.name}: ${t.description || ""}`);
    lines.push("");
  });
  lines.push("— TravelRadar. Verify locally.");
  return lines.join("\n");
}

function buildPrintHtml(subject, day, sections) {
  const secs = sections.map((s, i) => {
    const a = s.alerts.length ? `<ol>${s.alerts.map((x) => `<li><b>${esc(x.name)}</b> [${esc(x.severity || "m")}]<br/>${esc(x.description || "")}</li>`).join("")}</ol>` : "<p>No cached intel yet.</p>";
    const t = s.tips.length ? `<ol>${s.tips.map((x) => `<li><b>${esc(x.name)}</b><br/>${esc(x.description || "")}</li>`).join("")}</ol>` : "<p>No cached tips yet.</p>";
    return `<section><h2>${i + 1}. ${esc(s.city)}</h2><h3>Alerts (${s.alerts.length})</h3>${a}<h3>Tips (${s.tips.length})</h3>${t}</section>`;
  }).join("");
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${esc(subject)}</title><style>body{font-family:Georgia,serif;max-width:720px;margin:32px auto;padding:0 20px}h2{border-bottom:2px solid #111}li{margin:8px 0;line-height:1.5}section{page-break-inside:avoid}</style></head><body><h1>${esc(subject)}</h1><p>${sections.length} stops · ${esc(day)}</p>${secs}<script>window.onload=function(){window.print();}</script></body></html>`;
}
