import { supabase } from "@/lib/supabase";

export async function GET(request) {
  if (!supabase) return Response.json({ plan: "free" });

  const token = (request.headers.get("authorization") || "").replace(
    "Bearer ",
    ""
  );
  if (!token) return Response.json({ plan: "free" });

  const { data: userData } = await supabase.auth.getUser(token);
  const userId = userData?.user?.id;
  if (!userId) return Response.json({ plan: "free" });

  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();

  return Response.json({ plan: data?.plan || "free" });
}