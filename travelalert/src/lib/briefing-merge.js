// src/lib/briefing-merge.js
//
// Merge + cache-quality helpers used by /api/briefing. Extracted so the same
// logic can be imported by scripts and any future route without copy-paste.
// The inline versions previously living in /api/briefing/route.js were
// identical — this file is now the single source of truth.

// Targets the pipeline itself aims for (see cleanList in organize.js). Used
// as the fill ceiling when merging sparse live results with cached filler —
// NOT as an "is this valid" gate. A single alert is a valid result.
export const EXPECTED_ALERTS = 12;
export const EXPECTED_TIPS = 10;

/** Whether a pipeline result contains ANY usable live data. */
export function hasLiveData(org) {
  if (!org) return false;
  if (org.source !== "reddit+gemini") return false;
  return (org.alerts || []).length > 0 || (org.tips || []).length > 0;
}

/** Whether a cache row contains ANY usable data. */
export function cacheHasAny(cached) {
  if (!cached) return false;
  return (cached.alerts || []).length > 0 || (cached.tips || []).length > 0;
}

/**
 * Whether a cache row is rich enough that we can skip running the pipeline
 * for a cold visit. Unchanged from the original threshold. Sparse cache is
 * still served (via cacheHasAny), just with a pipeline top-up.
 */
export function cacheIsFull(cached) {
  if (!cached) return false;
  return (
    (cached.alerts || []).length >= 4 && (cached.tips || []).length >= 3
  );
}

/** Fisher–Yates, in-place. Returns the same array. */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Merge live results (kept first, in original order) with cached results
 * used as filler for the remaining display slots.
 *
 * Dedup by lowercased name. Filler is shuffled per call so two consecutive
 * refreshes of the same sparse city do not show the identical filler set.
 *
 * Live items are never dropped — even a single live alert always survives.
 * Only the filler slots are bounded by the EXPECTED_* targets.
 */
export function mergeLiveWithCache(
  liveAlerts,
  liveTips,
  cachedAlerts,
  cachedTips,
  targetAlerts = EXPECTED_ALERTS,
  targetTips = EXPECTED_TIPS,
) {
  const outAlerts = [];
  const outTips = [];
  const seenA = new Set();
  const seenT = new Set();
  const norm = (x) => String(x?.name || "").trim().toLowerCase();

  for (const a of liveAlerts || []) {
    const k = norm(a);
    if (!k || seenA.has(k)) continue;
    seenA.add(k);
    outAlerts.push(a);
  }
  for (const t of liveTips || []) {
    const k = norm(t);
    if (!k || seenT.has(k)) continue;
    seenT.add(k);
    outTips.push(t);
  }

  const fillA = shuffle(
    (cachedAlerts || []).filter((a) => {
      const k = norm(a);
      return k && !seenA.has(k);
    }),
  );
  const fillT = shuffle(
    (cachedTips || []).filter((t) => {
      const k = norm(t);
      return k && !seenT.has(k);
    }),
  );

  for (const a of fillA) {
    if (outAlerts.length >= targetAlerts) break;
    seenA.add(norm(a));
    outAlerts.push(a);
  }
  for (const t of fillT) {
    if (outTips.length >= targetTips) break;
    seenT.add(norm(t));
    outTips.push(t);
  }

  return { alerts: outAlerts, tips: outTips };
}