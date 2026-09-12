// src/lib/briefing-merge.js
//
// Shared predicates and merge helpers for pipeline results.
//
// Extracted from src/app/api/briefing/route.js so that the runtime route and
// the offline scripts/precache-top-cities.mjs batch use the EXACT same
// acceptance rules and the EXACT same merge behavior. Before this file
// existed, the script used a stricter threshold than the reader and silently
// discarded pipeline results that the dashboard would have served — a 3-alert
// / 1-tip result was written by the dashboard's path and rejected by the
// script's, producing "script reports success" output that the UI still
// showed as "no cached intel".
//
// Any change to the rules below MUST be made here, once. Do not duplicate.

export const EXPECTED_ALERTS = 12;
export const EXPECTED_TIPS = 10;

// Strict "cache is rich enough to skip the pipeline" thresholds. Used by the
// reader to decide whether a fresh visit can be served without running the
// pipeline at all, and by the pre-cache script's --skip-existing flag.
export const RICH_ALERTS = 4;
export const RICH_TIPS = 3;

/**
 * Whether a pipeline result contains ANY usable live data.
 *
 * The historical gate was `alerts.length >= 4 && tips.length >= 3`, which
 * rejected legitimate sparse pipelines (1–3 results) as "no data" and made
 * the UI show "no cached intel" even though the live fetch had succeeded.
 * The merge step below handles sparse results by topping them up with cache;
 * this gate only needs to decide "is there live output at all".
 */
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

/** Whether a cache row is rich enough to skip running the pipeline. */
export function cacheIsFull(cached) {
  if (!cached) return false;
  return (
    (cached.alerts || []).length >= RICH_ALERTS &&
    (cached.tips || []).length >= RICH_TIPS
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
 * Merge live results (kept first, in order — they are the freshest) with
 * cached results used as filler for the remaining display slots.
 *
 * Dedup by lowercased name so the same pattern never appears twice.
 * Filler is shuffled per call so two consecutive refreshes of the same
 * sparse city do not show the identical filler set.
 *
 * Live items are NEVER dropped — even a single live alert survives the
 * merge. Only filler slots are bounded by the EXPECTED_* targets.
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