import { supabase } from "./supabase";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function cityKey(city) {
  return String(city || "").trim().toLowerCase();
}

export async function getFreshCache(city) {
  if (!supabase) return null;

  const key = cityKey(city);
  if (key.length < 2) return null;

  const { data: row, error } = await supabase
    .from("destinations")
    .select("data, updated_at")
    .eq("city", key)
    .maybeSingle();

  if (error) {
    console.error("cache read failed:", error.message);
    return null;
  }

  if (!row) return null;

  const age = Date.now() - new Date(row.updated_at).getTime();
  if (Number.isNaN(age) || age > ONE_DAY_MS) return null;

  return row.data;
}

export async function saveCache(city, payload) {
  if (!supabase) return { ok: false, error: "supabase missing" };

  const key = cityKey(city);
  if (key.length < 2) return { ok: false, error: "city too short" };

  const { error } = await supabase.from("destinations").upsert({
    city: key,
    data: payload,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("cache write failed:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}