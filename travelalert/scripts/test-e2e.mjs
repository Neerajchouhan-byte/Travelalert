// Temporary E2E test: creates a throwaway user, calls the authed APIs, deletes the user.
// Usage: node scripts/test-e2e.mjs   (requires the dev server on :3210)
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
  if (m) env[m[1]] = m[2];
}

const BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
if (!BASE || !ANON || !SERVICE) {
  console.log("Missing Supabase env vars");
  process.exit(1);
}

const email = `e2e-test-${Date.now()}@travelradar-test.local`;
const password = "E2e-Test-Passw0rd!";
let userId = null;

async function j(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

async function main() {
  // 1. Create throwaway user (confirmed)
  const created = await j(`${BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  userId = created.body?.id;
  console.log("create user:", created.status, userId ? "ok" : JSON.stringify(created.body).slice(0, 200));
  if (!userId) return;

  try {
    // 2. Password grant sign-in
    const login = await j(`${BASE}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const token = login.body?.access_token;
    console.log("sign in:", login.status, token ? "ok" : JSON.stringify(login.body).slice(0, 200));
    if (!token) return;

    // 3. Briefing for a fresh, non-hardcoded city (plus comma-input variant)
    for (const city of ["Jaipur", "Jaipur, India"]) {
      const t0 = Date.now();
      const b = await j(`http://localhost:3210/api/briefing?city=${encodeURIComponent(city)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = b.body || {};
      console.log(`\nbriefing "${city}" [${b.status}] in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
      console.log("  plan:", d.plan, "| source:", d.source, "| safety:", d.safety);
      console.log("  alerts:", (d.alerts || []).length, "locked:", d.lockedAlerts, "| tips:", (d.tips || []).length, "locked:", d.lockedTips);
      console.log("  error:", d.error || "none", "| searchesLeft:", d.searchesLeft);
      (d.alerts || []).slice(0, 2).forEach((a) => console.log("   -", a.name, `[${a.severity}]`));
      if (city === "Jaipur") {
        console.log("  FREE PLAN OK:", d.plan === "free" && (d.alerts || []).length === 2 && (d.tips || []).length === 3 ? "YES" : "CHECK");
      }
    }

    // 4. City brief (weather / currency / forecast)
    const c = await j(`http://localhost:3210/api/city-brief?city=${encodeURIComponent("Jaipur")}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cb = c.body || {};
    console.log(`\ncity-brief [${c.status}]`);
    console.log("  city:", cb.city, "| country:", cb.country, cb.country_code, "| currency:", cb.code, cb.currencyName, "| 1 USD =", cb.usd);
    console.log("  weather:", JSON.stringify(cb.weather));
    console.log("  forecast:", (cb.forecast || []).map((f) => `${f.day}:${f.temp}°${f.type[0]}`).join("  "));
    console.log("  money_avoid:", cb.money_avoid);
    console.log("  money_best:", cb.money_best);
    console.log("  headline:", cb.weather_headline, "| note:", cb.weather_note);
  } finally {
    // 5. Cleanup throwaway user
    const del = await j(`${BASE}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
    });
    console.log("\ncleanup user:", del.status === 204 ? "deleted" : del.status);
  }
}

main();