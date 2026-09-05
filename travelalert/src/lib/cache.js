import { cityKey } from "./city";
import { adminDb } from "./supabase-admin";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function getFreshCache(city) {
  const key = cityKey(city);
  if (!key) return null;

  try {
    const { data: row, error } = await adminDb()
      .from("destinations")
      .select("data, updated_at")
      .eq("city", key)
      .maybeSingle();

    if (error || !row) return null;

    const age = Date.now() - new Date(row.updated_at).getTime();
    if (Number.isNaN(age) || age > ONE_DAY_MS) return null;
    return row.data;
  } catch (err) {
    console.error("cache read failed:", err.message);
    return null;
  }
}

export async function saveCache(city, payload) {
  const key = cityKey(city);
  if (!key) return { ok: false, error: "city too short" };

  try {
    const { error } = await adminDb().from("destinations").upsert({
      city: key,
      data: payload,
      updated_at: new Date().toISOString(),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    console.error("cache write failed:", err.message);
    return { ok: false, error: err.message };
  }
}