// src/lib/trip-briefing-format.js
//
// Shared loading and formatting for trip-briefing exports.
//
// Used by:
//   GET  /api/trips/[id]/export  → JSON / print HTML / pocket HTML
//   POST /api/trips/[id]/email   → Resend payload
//
// Content source is identical in all cases: getCachedCity per destination
// (cache-only; a saved trip is not a live search), sliced by plan. No live
// pipeline runs from here — that only happens at add-time via
// /api/trips/quick-add.

import { getCachedCity } from "./cache.js";
import { sliceForPlan } from "./auth-server.js";

/**
 * Loads a trip and its per-destination cached briefing, sliced by plan.
 *
 * @returns {{ trip, sections }} on success, or { error, status } on failure.
 */
export async function loadTripSections(admin, tripId, userId, plan) {
  const { data: trip } = await admin
    .from("trips")
    .select("id, name")
    .eq("id", tripId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!trip) return { error: "Trip not found", status: 404 };

  const { data: dests } = await admin
    .from("trip_destinations")
    .select("city, visit_date")
    .eq("trip_id", tripId)
    .order("order_index");

  const sections = [];
  for (const stop of dests || []) {
    const cached = await getCachedCity(stop.city);
    const alerts = cached?.data?.alerts || [];
    const tips = cached?.data?.tips || [];
    const s = sliceForPlan(plan, alerts, tips);
    sections.push({
      city: stop.city,
      visit_date: stop.visit_date,
      alerts: s.alerts,
      tips: s.tips,
    });
  }

  return { trip, sections };
}

/** Plain-text body for the mailto draft and the Resend `text` field. */
export function buildTextBody(trip, day, sections) {
  const lines = [`${trip.name} — ${sections.length} stops (${day})`, ""];
  sections.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.city}${s.visit_date ? " — " + s.visit_date : ""}`);
    lines.push(`   ALERTS (${s.alerts.length}):`);
    if (!s.alerts.length) lines.push("   - No cached intel yet.");
    for (const a of s.alerts) {
      lines.push(
        `   - ${a.name} [${a.severity || "medium"}]: ${a.description || ""}`,
      );
    }
    lines.push(`   TIPS (${s.tips.length}):`);
    if (!s.tips.length) lines.push("   - No cached tips yet.");
    for (const t of s.tips) {
      lines.push(`   - ${t.name}: ${t.description || ""}`);
    }
    lines.push("");
  });
  lines.push("— TravelRadar. Verify locally.");
  return lines.join("\n");
}

function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Print-ready HTML for the "Save as PDF" path. Includes auto-print. */
export function buildPrintHtml(subject, day, sections) {
  const secs = sections
    .map((s, i) => {
      const a = s.alerts.length
        ? `<ol>${s.alerts
            .map(
              (x) =>
                `<li><b>${esc(x.name)}</b> [${esc(x.severity || "m")}]<br/>${esc(
                  x.description || "",
                )}</li>`,
            )
            .join("")}</ol>`
        : "<p>No cached intel yet.</p>";
      const t = s.tips.length
        ? `<ol>${s.tips
            .map(
              (x) =>
                `<li><b>${esc(x.name)}</b><br/>${esc(x.description || "")}</li>`,
            )
            .join("")}</ol>`
        : "<p>No cached tips yet.</p>";
      return `<section><h2>${i + 1}. ${esc(s.city)}</h2><h3>Alerts (${s.alerts.length})</h3>${a}<h3>Tips (${s.tips.length})</h3>${t}</section>`;
    })
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${esc(subject)}</title><style>body{font-family:Georgia,serif;max-width:720px;margin:32px auto;padding:0 20px}h2{border-bottom:2px solid #111}li{margin:8px 0;line-height:1.5}section{page-break-inside:avoid}</style></head><body><h1>${esc(subject)}</h1><p>${sections.length} stops · ${esc(day)}</p>${secs}<script>window.onload=function(){window.print();}</script></body></html>`;
}

/** Single-page airport card. Print-ready. */
export function buildPocketHtml(trip, day, sections, id) {
  const items = sections
    .map((s, i) => {
      const top = (s.alerts || [])[0];
      return `<li><b>${i + 1}. ${esc(s.city)}</b>${
        s.visit_date ? ` <span>${esc(s.visit_date)}</span>` : ""
      }${top ? `<br/><span class="a">${esc(top.name)}</span>` : ""}</li>`;
    })
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${esc(
    trip.name,
  )} — pocket card</title><style>body{font-family:-apple-system,system-ui,sans-serif;margin:20px;color:#111}ol{line-height:1.55}span{color:#666;font-size:12px}.a{color:#c3182a}</style></head><body><h1>${esc(
    trip.name,
  )}</h1><p>${esc(day)}</p><ol>${items}</ol><script>window.onload=function(){window.print();}</script></body></html>`;
}

/**
 * Email-client-safe HTML. Table-based layout, inline styles, no flex/grid,
 * no script tags. This is what actually goes to Resend.
 *
 * Kept deliberately plain: most email clients strip <style> blocks and
 * ignore modern CSS, so every rule is inlined on the element.
 */
export function buildEmailHtml(trip, day, sections) {
  const accent = "#e5283b";
  const textColor = "#18181b";
  const mutedColor = "#71717a";
  const borderColor = "#e8e6df";

  const sectionsHtml = sections
    .map((s, i) => {
      const alertsHtml = s.alerts.length
        ? s.alerts
            .map(
              (a) => `
              <tr>
                <td style="padding:8px 0;border-top:1px solid ${borderColor};vertical-align:top;">
                  <div style="font-weight:700;color:${textColor};font-size:13px;">${esc(a.name)}</div>
                  <div style="font-size:11px;color:${accent};font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-top:2px;">${esc(a.severity || "medium")}</div>
                  <div style="font-size:12px;color:${mutedColor};line-height:1.5;margin-top:4px;">${esc(a.description || "")}</div>
                </td>
              </tr>`,
            )
            .join("")
        : `<tr><td style="padding:8px 0;border-top:1px solid ${borderColor};font-size:12px;color:${mutedColor};">No cached intel yet.</td></tr>`;

      const tipsHtml = s.tips.length
        ? s.tips
            .map(
              (t) => `
              <tr>
                <td style="padding:8px 0;border-top:1px solid ${borderColor};vertical-align:top;">
                  <div style="font-weight:700;color:${textColor};font-size:13px;">${esc(t.name)}</div>
                  <div style="font-size:12px;color:${mutedColor};line-height:1.5;margin-top:4px;">${esc(t.description || "")}</div>
                </td>
              </tr>`,
            )
            .join("")
        : `<tr><td style="padding:8px 0;border-top:1px solid ${borderColor};font-size:12px;color:${mutedColor};">No cached tips yet.</td></tr>`;

      return `
        <tr><td style="padding:24px 0 0 0;">
          <div style="font-size:11px;font-weight:700;color:${mutedColor};text-transform:uppercase;letter-spacing:0.08em;">Stop ${String(i + 1).padStart(2, "0")}</div>
          <div style="font-size:20px;font-weight:900;color:${textColor};letter-spacing:-0.01em;margin-top:2px;">${esc(s.city)}</div>
          ${s.visit_date ? `<div style="font-size:12px;color:${mutedColor};margin-top:2px;">${esc(s.visit_date)}</div>` : ""}
        </td></tr>
        <tr><td style="padding-top:14px;">
          <div style="font-size:11px;font-weight:800;color:${accent};text-transform:uppercase;letter-spacing:0.08em;">Alerts (${s.alerts.length})</div>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;">${alertsHtml}</table>
        </td></tr>
        <tr><td style="padding-top:14px;">
          <div style="font-size:11px;font-weight:800;color:#d97706;text-transform:uppercase;letter-spacing:0.08em;">Tips (${s.tips.length})</div>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;">${tipsHtml}</table>
        </td></tr>`;
    })
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(trip.name)}</title>
</head>
<body style="margin:0;padding:0;background:#f7f6f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${textColor};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f7f6f2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${borderColor};border-radius:20px;padding:32px;">
          <tr><td>
            <div style="font-size:11px;font-weight:800;color:${accent};text-transform:uppercase;letter-spacing:0.12em;">TravelRadar Trip Briefing</div>
            <h1 style="margin:8px 0 4px 0;font-size:26px;font-weight:900;color:${textColor};letter-spacing:-0.02em;">${esc(trip.name)}</h1>
            <div style="font-size:12px;color:${mutedColor};">${sections.length} stop${sections.length === 1 ? "" : "s"} · ${esc(day)}</div>
          </td></tr>
          ${sectionsHtml}
          <tr><td style="padding-top:28px;border-top:1px solid ${borderColor};margin-top:24px;font-size:11px;color:${mutedColor};line-height:1.6;">
            Reports are sourced from public community discussion and AI-summarized. Not independently verified. Use your own judgment.
            <br/><br/>
            <a href="https://travelradar.live/disclaimer" style="color:${accent};text-decoration:none;font-weight:700;">Read the full disclaimer →</a>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}