import { cityKey } from "./city.js";
import { adminDb } from "./supabase-admin.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const BRIEF_TTL_MS = 60 * 60 * 1000; // 1 hour — weather + FX snapshot
const MAX_IN_MEMORY_ENTRIES = 100; // Strictly bound RAM usage

// Self-pruning memory cache for intel (alerts + tips).
const memoryCache = new Map();

// Separate in-process cache for the city-brief payload (weather + FX). Kept
// separate from the intel cache because it has a different TTL (1h vs 24h)
// and is populated by a different route. Bounded to the same 100 entries.
const briefMemoryCache = new Map();

function setMemoryBounded(map, key, value) {
  if (map.size >= MAX_IN_MEMORY_ENTRIES) {
    const oldestKey = map.keys().next().value;
    map.delete(oldestKey);
  }
  map.set(key, value);
}

async function readCityRow(key) {
  const { data: rows, error } = await adminDb()
    .from("destinations")
    .select("data, updated_at")
    .eq("city", key)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("cache read failed:", key, error.message);
    return null;
  }

  return Array.isArray(rows) ? rows[0] || null : rows || null;
}

export async function getFreshCache(city) {
  const key = cityKey(city);
  if (!key) return null;

  const inMem = memoryCache.get(key);
  if (inMem && Date.now() - inMem.time < ONE_DAY_MS) {
    return inMem.data;
  }

  try {
    const row = await readCityRow(key);
    if (!row) return null;

    const age = Date.now() - new Date(row.updated_at).getTime();
    if (Number.isNaN(age) || age > ONE_DAY_MS) return null;

    setMemoryBounded(memoryCache, key, { data: row.data, time: Date.now() });
    return row.data;
  } catch (err) {
    console.error("cache read failed:", err.message);
    return null;
  }
}

export async function saveCache(city, payload) {
  const key = cityKey(city);
  if (!key) return { ok: false, error: "city too short" };

  setMemoryBounded(memoryCache, key, { data: payload, time: Date.now() });

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

export async function getCachedCity(city) {
  const key = cityKey(city);
  if (!key) return null;

  try {
    const row = await readCityRow(key);
    if (!row) return null;

    return {
      data: row.data,
      updatedAt: row.updated_at,
    };
  } catch (err) {
    console.error("cache read failed:", err.message);
    return null;
  }
}

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

/**
 * Real live COUNT(*) against the destinations table.
 *
 * `head: true` returns only the count metadata (no row body transferred);
 * `count: "exact"` asks PostgREST for an accurate count, not an estimate.
 * Returns 0 on error so the landing page can degrade gracefully.
 */
export async function countCachedCities() {
  try {
    const { count, error } = await adminDb()
      .from("destinations")
      .select("city", { count: "exact", head: true });

    if (error) {
      console.error("cache count failed:", error.message);
      return 0;
    }

    return typeof count === "number" ? count : 0;
  } catch (err) {
    console.error("cache count failed:", err.message);
    return 0;
  }
}

/**
 * In-process cache for the /api/city-brief payload (weather + FX + geocoding).
 *
 * TTL is 1 hour. Long enough that a dashboard visit rarely triggers the three
 * external HTTP calls, short enough that an hourly user still sees fresh
 * conditions. Not persisted — on cold server restart the first request per
 * city re-fetches. That is acceptable; the previous behavior was zero caching.
 *
 * Reads and writes are keyed by cityKey() so "Tokyo" and "tokyo" resolve to
 * the same entry.
 */
export function getCachedBrief(city) {
  const key = cityKey(city);
  if (!key) return null;
  const entry = briefMemoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.time > BRIEF_TTL_MS) {
    briefMemoryCache.delete(key);
    return null;
  }
  return entry.data;
}

export function saveCachedBrief(city, data) {
  const key = cityKey(city);
  if (!key) return;
  setMemoryBounded(briefMemoryCache, key, { data, time: Date.now() });
}