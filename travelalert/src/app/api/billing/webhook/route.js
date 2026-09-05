import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

export async function POST(request) {
  const raw = await request.text();
  const sig = request.headers.get("x-signature") || "";
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "";

  if (!secret) {
    return Response.json({ error: "webhook secret missing" }, { status: 500 });
  }

  const digest = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ error: "bad signature" }, { status: 401 });
  }

  const event = JSON.parse(raw);
  const name = event?.meta?.event_name || "";
  const paid =
    name === "order_created" || name === "subscription_created";
  if (!paid) return Response.json({ ok: true, ignored: name });

  const userId =
    event?.meta?.custom_data?.user_id ||
    event?.data?.attributes?.checkout_data?.custom?.user_id ||
    "";
  const productName = String(
    event?.data?.attributes?.first_order_item?.product_name ||
      event?.data?.attributes?.product_name ||
      ""
  ).toLowerCase();

  const plan = productName.includes("lifetime") ? "lifetime" : "pro";

  if (!userId) {
    return Response.json({ ok: true, skipped: "no user_id" });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  await admin.from("profiles").upsert({ user_id: userId, plan });

  return Response.json({ ok: true, plan, userId });
}