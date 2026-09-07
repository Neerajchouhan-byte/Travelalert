// Phase 2: real-credentials webhook test. Uses DODO_PAYMENTS_WEBHOOK_SECRET
// and DODO_*_PRODUCT_ID from .env.local (or TEST_WEBHOOK_SECRET override),
// fires properly signed events, and checks the resulting subscription state.
import { readFileSync } from "node:fs";
import { Webhook } from "standardwebhooks";

const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
  if (m) env[m[1]] = m[2];
}
const BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const APP = process.env.TEST_APP_URL || "http://localhost:3211";

const SECRET = process.env.TEST_WEBHOOK_SECRET || env.DODO_PAYMENTS_WEBHOOK_SECRET;
const ANNUAL_PID = env.DODO_ANNUAL_PRODUCT_ID;
const TRIP_PID = env.DODO_TRIP_PASS_PRODUCT_ID;
if (!SECRET) { console.log("No webhook secret found (.env.local DODO_PAYMENTS_WEBHOOK_SECRET or TEST_WEBHOOK_SECRET)."); process.exit(1); }
if (!ANNUAL_PID || !TRIP_PID) { console.log("Missing DODO_ANNUAL_PRODUCT_ID / DODO_TRIP_PASS_PRODUCT_ID in .env.local."); process.exit(1); }
console.log("Using real secret + product IDs from env (annual:", ANNUAL_PID.slice(0, 10) + "…, trip:", TRIP_PID.slice(0, 10) + "…)");

const email = `bill-p2-${Date.now()}@example.com`;
const password = "Bill-Test-Passw0rd!";
let userId = null;

async function j(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

function signedWebhook(payloadObj, { badSignature = false } = {}) {
  const msgId = "msg_" + Math.random().toString(36).slice(2);
  const tsDate = new Date();
  const ts = String(Math.floor(tsDate.getTime() / 1000));
  const body = JSON.stringify(payloadObj);
  const wh = new Webhook(SECRET);
  let sig = wh.sign(msgId, tsDate, body);
  if (badSignature) sig = "v1," + Buffer.from("garbage-signature-value").toString("base64");
  return j(`${APP}/api/billing/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "webhook-id": msgId,
      "webhook-signature": sig,
      "webhook-timestamp": ts,
    },
    body,
  });
}

async function main() {
  const created = await j(`${BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  userId = created.body?.id;
  if (!userId) { console.log("user create failed"); return; }

  const login = await j(`${BASE}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const token = login.body?.access_token;
  if (!token) { console.log("sign-in failed"); return; }
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const now = new Date();
  const year = new Date(now.getTime() + 365 * 24 * 3600 * 1000).toISOString();

  // 1) Valid signature, annual subscription.active
  const annual = {
    type: "subscription.active",
    timestamp: now.toISOString(),
    data: {
      product_id: ANNUAL_PID,
      status: "active",
      subscription_id: "sub_test_123",
      customer: { customer_id: "cust_test_1" },
      metadata: { travelradar_user_id: userId },
      next_billing_date: year,
      previous_billing_date: now.toISOString(),
    },
  };
  console.log("1) webhook VALID sig (annual):", JSON.stringify((await signedWebhook(annual)).body).slice(0, 140));

  // 2) Valid signature, trip_pass payment.succeeded
  const trip = {
    type: "payment.succeeded",
    timestamp: now.toISOString(),
    data: {
      payment_id: "pay_test_789",
      product_id: TRIP_PID,
      status: "succeeded",
      customer: { customer_id: "cust_test_1" },
      metadata: { travelradar_user_id: userId },
      paid_at: now.toISOString(),
    },
  };
  console.log("2) webhook VALID sig (trip_pass):", JSON.stringify((await signedWebhook(trip)).body).slice(0, 140));

  // 3) INVALID signature must be rejected
  console.log("3) webhook INVALID sig:", JSON.stringify((await signedWebhook(annual, { badSignature: true })).body).slice(0, 140));

  // 4) Checkout with product IDs set but no DODO_PAYMENTS_API_KEY
  const co = await j(`${APP}/api/billing/checkout`, { method: "POST", headers: auth, body: JSON.stringify({ plan: "annual" }) });
  console.log("4) checkout (no API key):", co.status, JSON.stringify(co.body).slice(0, 140));

  // 5) Subscription state after webhook attempts
  const sub = await j(`${APP}/api/billing/subscription`, { headers: auth });
  console.log("5) subscription after:", sub.status, JSON.stringify(sub.body).slice(0, 160));

  // 6) Briefing should now be unlocked (annual) — 12 alerts, 0 locked
  const b = await j(`${APP}/api/briefing?city=${encodeURIComponent("Tokyo")}`, { headers: auth });
  const d = b.body || {};
  console.log("6) briefing after Pro:", b.status, "| plan:", d.plan, "| alerts:", (d.alerts || []).length, "locked:", d.lockedAlerts, "| tips:", (d.tips || []).length, "locked:", d.lockedTips);
  console.log("   PRO UNLOCK OK:", d.plan !== "free" && (d.alerts || []).length >= 10 && d.lockedAlerts === 0 ? "YES" : "CHECK");
}

main()
  .catch((e) => console.log("ERROR:", e.message))
  .finally(async () => {
    if (userId) {
      const del = await fetch(`${BASE}/auth/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
      });
      console.log("cleanup user:", del.status === 204 ? "deleted" : del.status);
    }
  });