export async function ensureFreeProfile(supabase) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.id) return;

  const userId = data.user.id;

  const { data: existing } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return;

  await supabase.from("profiles").insert({
    user_id: userId,
    plan: "free",
  });
}