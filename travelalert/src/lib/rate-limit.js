// src/lib/rate-limit.js
const buckets = new Map();
const WINDOW_MS = 60_000;

export function checkRateLimit(key, maxPerWindow = 30) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    buckets.set(key, { windowStart: now, count: 1 });
    return { ok: true, remaining: maxPerWindow - 1 };
  }
  entry.count += 1;
  if (entry.count > maxPerWindow) return { ok: false, remaining: 0 };

  if (buckets.size > 5000) {
    const iter = buckets.keys();
    for (let i = 0; i < 1000; i++) {
      const k = iter.next().value;
      if (k === undefined) break;
      buckets.delete(k);
    }
  }
  return { ok: true, remaining: maxPerWindow - entry.count };
}