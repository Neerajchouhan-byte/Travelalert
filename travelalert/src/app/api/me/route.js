import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = (request.headers.get("authorization") || "").replace(
    "Bearer ",
    ""
  );

  if (!url || !anon || !token) {
    return Response.json({ plan: "free" });
  }

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: "Bearer " + token } },
  });

  const { data: userData } = await supabase.auth.getUser(token);
  const userId = userData?.user?.id;
  if (!userId) return Response.json({ plan: "free" });

  const { data, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();

  return Response.json({
    plan: data?.plan || "free",
    error: error?.message || null,
  });
}