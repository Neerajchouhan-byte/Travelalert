// Phase 1 tests against a dev server WITHOUT Dodo env vars.
// Usage: node scripts/test-billing-phase1.mjs
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
  if (m) env[m[1]] = m[2];
}
const BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const APP = "http://localhost:3211";

const email = `bill-test-${Date.now()}@example.com`;
const email2 = `travelradar.e2e+${Date.now()}@gmail.com`;
const password = "Bill-Test-Passw0rd!";
let userId = null;
let billingUserId = null;

async function j(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

async function main() {
  // A) Public signup endpoint (step 3 of the checklist)
  const signup = await j(`${BASE}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email: email2, password }),
  });
  userId = signup.body?.id || signup.body?.user?.id || null;
  console.log("A) /auth signup:", signup.status,
    "| has session:", Boolean(signup.body?.access_token),
    "| needs email confirm:", !signup.body?.access_token && signup.status === 200,
    userId ? "| user created" : "| rejected: " + JSON.stringify(signup.body).slice(0, 120));

  // A2) Always create an admin-confirmed user for the billing API tests
  const created = await j(`${BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const billingUserId2 = created.body?.id;
  billingUserId = billingUserId2;
  console.log("A2) admin-created (confirmed) user:", created.status, billingUserId ? "ok" : "FAILED");

  const loginEmail = email;

  // Sign in via password grant regardless
  const login = await j(`${BASE}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email: loginEmail, password }),
  });
  const token = login.body?.access_token;
  console.log("B) password sign-in:", login.status, token ? "ok" : "FAILED (email confirm required?)");
  if (!token) return;

  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // C) Checkout without Dodo keys (step 7)
  const co = await j(`${APP}/api/billing/checkout`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ plan: "annual" }),
  });
  console.log("C) checkout:", co.status, JSON.stringify(co.body).slice(0, 160));

  // D) Webhook with no secret configured (step 8)
  const wh = await j(`${APP}/api/billing/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "webhook-id": "m1", "webhook-signature": "v1,x", "webhook-timestamp": "1" },
    body: JSON.stringify({ type: "subscription.active", data: {} }),
  });
  console.log("D) webhook (no secret):", wh.status, JSON.stringify(wh.body).slice(0, 120));

  // E) Subscription status endpoint (step 9)
  const sub = await j(`${APP}/api/billing/subscription`, { headers: auth });
  console.log("E) subscription:", sub.status, JSON.stringify(sub.body).slice(0, 200));
}

main()
  .catch((e) => console.log("ERROR:", e.message))
  .finally(async () => {
    for (const [label, id] of [["signup user", userId], ["billing user", billingUserId]]) {
      if (!id) continue;
      const del = await fetch(`${BASE}/auth/v1/admin/users/${id}`, {
        method: "DELETE",
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
      });
      console.log(`cleanup ${label}:`, del.status === 204 ? "deleted" : del.status);
    }
  });