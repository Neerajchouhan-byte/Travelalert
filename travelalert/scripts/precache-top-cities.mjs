// Pre-cache pipeline for the top 50 destinations.
//
// Reuses the exact production pipeline (organizeCity → Serper → Gemini),
// the exact production acceptance predicate, and the exact production
// merge helper (all imported from src/lib/briefing-merge.js). Nothing here
// is new logic.
//
// Usage:
//   node scripts/precache-top-cities.mjs                     # run all 50
//   node scripts/precache-top-cities.mjs "Paris" "Tokyo"     # only these
//   node scripts/precache-top-cities.mjs --skip-existing     # skip rich cache rows
//   node scripts/precache-top-cities.mjs --dry-run           # list only, no API calls
//
// Requires .env.local with:
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   SERPER_API_KEY, GEMINI_API_KEY

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
  if (m) process.env[m[1]] = m[2];
}

const CITIES = [
  "Bangkok",        // 1
  "Hong Kong",      // 2
  "London",         // 3
  "Macau",          // 4
  "Istanbul",       // 5
  "Dubai",          // 6
  "Mecca",          // 7
  "Antalya",        // 8
  "Paris",          // 9
  "Kuala Lumpur",   // 10
  "Madrid",         // 11
  "Tokyo",          // 12
  "Rome",           // 13
  "Milan",          // 14
  "New York",       // 15
  "Amsterdam",      // 16
  "Barcelona",      // 17
  "Singapore",      // 18
  "Seoul",          // 19
  "Osaka",          // 20
  "Kyoto",          // 21
  "Taipei",         // 22
  "Venice",         // 23
  "Florence",       // 24
  "Lisbon",         // 25
  "Prague",         // 26
  "Vienna",         // 27
  "Berlin",         // 28
  "Athens",         // 29
  "Santorini",      // 30
  "Marrakech",      // 31
  "Cairo",          // 32
  "Bali",           // 33
  "Phuket",         // 34
  "Delhi",          // 35
  "Mumbai",         // 36
  "Jaipur",         // 37
  "Agra",           // 38
  "Ho Chi Minh City", // 39
  "Hanoi",          // 40
  "Siem Reap",      // 41
  "Rio de Janeiro", // 42
  "Buenos Aires",   // 43
  "Mexico City",    // 44
  "Cancun",         // 45
  "Cape Town",      // 46
  "Miami",          // 47
  "Las Vegas",      // 48
  "Sydney",         // 49
  "Shanghai",       // 50
];

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SKIP_EXISTING = args.includes("--skip-existing");
const SPECIFIC = args.filter((a) => !a.startsWith("--"));

const targets = SPECIFIC.length
  ? CITIES.filter((c) =>
      SPECIFIC.some((s) => c.toLowerCase() === s.toLowerCase()),
    )
  : CITIES;

const DELAY_MS = 3000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Load production modules AFTER env is populated.
const { organizeCity } = await import("../src/lib/organize.js");
const { saveCache, getFreshCache } = await import("../src/lib/cache.js");
const { normalizeCity } = await import("../src/lib/city.js");
const {
  hasLiveData,
  cacheIsFull,
  cacheHasAny,
  mergeLiveWithCache,
} = await import("../src/lib/briefing-merge.js");

async function runOne(rawCity) {
  const city = normalizeCity(rawCity);
  if (!city) {
    return { city: rawCity, status: "failed", reason: "unrecognized city name" };
  }

  const t0 = Date.now();

  // --skip-existing: skip cities whose cache is already rich enough that
  // the reader would not run the pipeline on a fresh visit.
  if (SKIP_EXISTING) {
    const existing = await getFreshCache(city);
    if (cacheIsFull(existing)) {
      return {
        city,
        status: "skipped",
        reason: `already cached (${existing.alerts.length} alerts, ${existing.tips.length} tips)`,
        ms: Date.now() - t0,
      };
    }
  }

  let org;
  try {
    org = await organizeCity(city);
  } catch (err) {
    return {
      city,
      status: "failed",
      reason: `organizeCity threw: ${err?.message || err}`,
      ms: Date.now() - t0,
    };
  }

  // Same acceptance predicate as /api/briefing. Any live output at all is
  // accepted; sparse results are topped up by the merge below.
  if (!hasLiveData(org)) {
    let reason;
    if (!org) {
      reason = "organizeCity returned no result";
    } else if (org.source === "seed") {
      reason = "pipeline fell back to seed (no live Serper/Gemini output)";
    } else if (org.source !== "reddit+gemini") {
      reason = `unexpected pipeline source "${org.source}"`;
    } else {
      reason = `no live items returned (0 alerts, 0 tips)`;
    }
    return { city, status: "failed", reason, ms: Date.now() - t0 };
  }

  // Fetch any existing cache so the merge has filler to draw on. On a cold
  // city this returns null and the merge is a no-op. On a re-run it tops up
  // the new result with whatever was already cached.
  const cached = await getFreshCache(city);

  const merged = mergeLiveWithCache(
    org.alerts || [],
    org.tips || [],
    cached?.alerts || [],
    cached?.tips || [],
  );

  const payload = {
    city,
    alerts: merged.alerts,
    tips: merged.tips,
    source: org.source,
    fetchedAt: new Date().toISOString(),
    error: null,
  };

  const write = await saveCache(city, payload);
  if (!write?.ok) {
    return {
      city,
      status: "failed",
      reason: `cache write failed: ${write?.error || "unknown"}`,
      ms: Date.now() - t0,
    };
  }

  const liveCount = (org.alerts || []).length + (org.tips || []).length;
  const mergedCount = payload.alerts.length + payload.tips.length;
  const note =
    mergedCount > liveCount
      ? ` (merged with ${mergedCount - liveCount} cached filler)`
      : "";

  return {
    city,
    status: "success",
    alerts: payload.alerts.length,
    tips: payload.tips.length,
    source: payload.source,
    note,
    ms: Date.now() - t0,
  };
}

async function main() {
  if (targets.length === 0) {
    console.log("No matching cities. Nothing to do.");
    return;
  }

  console.log(
    `\nPre-cache pipeline — ${targets.length} ${
      targets.length === 1 ? "city" : "cities"
    }${DRY_RUN ? "  (DRY RUN)" : ""}${
      SKIP_EXISTING ? "  (skip already-cached)" : ""
    }\n`,
  );

  if (DRY_RUN) {
    targets.forEach((c, i) => console.log(`  ${String(i + 1).padStart(2, "0")}. ${c}`));
    return;
  }

  const results = [];
  for (let i = 0; i < targets.length; i++) {
    const city = targets[i];
    const r = await runOne(city);
    results.push(r);

    const badge =
      r.status === "success" ? "OK  " : r.status === "skipped" ? "SKIP" : "FAIL";
    const detail =
      r.status === "success"
        ? `${r.alerts} alerts / ${r.tips} tips (${r.source})${r.note || ""}`
        : r.reason;
    console.log(
      `[${String(i + 1).padStart(2, "0")}/${targets.length}] ${badge} ${city}  —  ${detail}  (${(
        r.ms / 1000
      ).toFixed(1)}s)`,
    );

    if (i < targets.length - 1) await sleep(DELAY_MS);
  }

  const ok = results.filter((r) => r.status === "success");
  const skipped = results.filter((r) => r.status === "skipped");
  const failed = results.filter((r) => r.status === "failed");

  console.log("\n——— Summary ———");
  console.log(`Success: ${ok.length}`);
  console.log(`Skipped: ${skipped.length}`);
  console.log(`Failed:  ${failed.length}`);

  if (failed.length) {
    console.log("\nFailed cities (re-run individually with the same script):");
    for (const f of failed) {
      console.log(`  - ${f.city}: ${f.reason}`);
    }
    console.log(
      `\nRe-run one at a time: node scripts/precache-top-cities.mjs "City Name"`,
    );
  }
}

main().catch((err) => {
  console.error("Pipeline crashed:", err);
  process.exit(1);
});