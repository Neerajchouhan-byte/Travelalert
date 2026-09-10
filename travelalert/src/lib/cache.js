import { cityKey } from "./city.js";
import { adminDb } from "./supabase-admin.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_IN_MEMORY_ENTRIES = 100; // Strictly bound RAM usage to top 100 cities

// Self-pruning memory cache (prevents OOM crashes)
const memoryCache = new Map();

function setMemoryBounded(key, value) {
  if (memoryCache.size >= MAX_IN_MEMORY_ENTRIES) {
    // Evict oldest entry
    const oldestKey = memoryCache.keys().next().value;
    memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, value);
}

export async function getFreshCache(city) {
  const key = cityKey(city);
  if (!key) return null;

  // 1. Check RAM (0ms)
  const inMem = memoryCache.get(key);
  if (inMem && Date.now() - inMem.time < ONE_DAY_MS) {
    return inMem.data;
  }

  // 2. Check Supabase Database (~30ms)
  try {
    const { data: row, error } = await adminDb()
      .from("destinations")
      .select("data, updated_at")
      .eq("city", key)
      .maybeSingle();

    if (error || !row) return null;

    const age = Date.now() - new Date(row.updated_at).getTime();
    if (Number.isNaN(age) || age > ONE_DAY_MS) return null;

    setMemoryBounded(key, { data: row.data, time: Date.now() });
    return row.data;
  } catch (err) {
    console.error("cache read failed:", err.message);
    return null;
  }
}

export async function saveCache(city, payload) {
  const key = cityKey(city);
  if (!key) return { ok: false, error: "city too short" };

  setMemoryBounded(key, { data: payload, time: Date.now() });

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

/**
 * Reads a cached destination WITHOUT the freshness filter.
 *
 * getFreshCache() intentionally returns null for rows older than 24h so live
 * search never serves stale data. SEO destination pages have the opposite
 * requirement — the page must keep rendering even when the cache is old, or
 * Google would 404 on URLs it has already indexed.
 *
 * Same table, same client, same row shape — only the age filter is skipped.
 */
export async function getCachedCity(city) {
  const key = cityKey(city);
  if (!key) return null;

  try {
    const { data: row, error } = await adminDb()
      .from("destinations")
      .select("data, updated_at")
      .eq("city", key)
      .maybeSingle();

    if (error || !row) return null;

    return {
      data: row.data,
      updatedAt: row.updated_at,
    };
  } catch (err) {
    console.error("cache read failed:", err.message);
    return null;
  }
}

/**
 * Lists every city currently in the destinations cache. Used by
 * generateStaticParams, sitemap, and the /scams index. Bounded to 500 rows to
 * keep the query cheap regardless of table growth.
 */
export async function listCachedCities() {
  try {
    const { data, error } = await adminDb()
      .from("destinations")
      .select("city, updated_at")
      .limit(500);

    if (error) {
      console.error("cache list failed:", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("cache list failed:", err.message);
    return [];
  }
}