import { createHmac, timingSafeEqual } from "crypto";
import { adminDb } from "@/lib/supabase-admin";

function safeEqualHex(a, b) {
  const left = Buffer.from(String(a), "utf8");
  const right = Buffer.from(String(b), "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function planFromEvent(event) {
  const attrs = event?.data?.attributes || {};
  const variantId = String(
    attrs.first_order_item?.variant_id ||
      attrs.variant_id ||
      event?.meta?.custom_data?.variant_id ||
      ""
  );

  const proId = process.env.LEMON_SQUEEZY_PRO_VARIANT_ID || "";
  const lifeId = process.env.LEMON_SQUEEZY_LIFE_VARIANT_ID || "";

  if (lifeId && variantId === String(lifeId)) return "lifetime";
  if (proId && variantId === String(proId)) return "pro";

  const name = String(
    attrs.first_order_item?.product_name || attrs.product_name || ""
  ).toLowerCase();

  if (name.includes("lifetime") || name.includes("ultimate")) return "lifetime";
  if (name.includes("pro")) return "pro";
  return "pro";
}

export async function POST(request) {
  const raw = await request.text();
  const sig = request.headers.get("x-signature") || "";
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "";

  if (!secret) {
    return Response.json({ error: "webhook secret missing" }, { status: 500 });
  }

  const digest = createHmac("sha256", secret).update(raw).digest("hex");
  if (!safeEqualHex(digest, sig)) {
    return Response.json({ error: "bad signature" }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const name = event?.meta?.event_name || "";
  const userId =
    event?.meta?.custom_data?.user_id ||
    event?.data?.attributes?.checkout_data?.custom?.user_id ||
    "";

  if (!userId) {
    return Response.json({ ok: true });
  }

  const status = String(event?.data?.attributes?.status || "").toLowerCase();
  const paidEvents = new Set([
    "order_created",
    "subscription_created",
    "subscription_updated",
  ]);
  const cancelEvents = new Set([
    "subscription_cancelled",
    "subscription_expired",
    "subscription_payment_failed",
    "order_refunded",
  ]);

  const admin = adminDb();
  const { data: existing } = await admin
    .from("profiles")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();
  const current = existing?.plan || "free";

  if (
    paidEvents.has(name) &&
    (!status || status === "paid" || status === "active")
  ) {
    const incoming = planFromEvent(event);
    const next =
      current === "lifetime" || incoming === "lifetime" ? "lifetime" : incoming;
    await admin.from("profiles").upsert({ user_id: userId, plan: next });
    return Response.json({ ok: true });
  }

  if (cancelEvents.has(name)) {
    const next =
      current === "lifetime" && name !== "order_refunded" ? "lifetime" : "free";
    await admin.from("profiles").upsert({ user_id: userId, plan: next });
    return Response.json({ ok: true });
  }

  return Response.json({ ok: true });
}