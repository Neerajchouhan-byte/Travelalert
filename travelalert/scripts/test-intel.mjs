// Temporary integration test for the AI + Reddit + geocoding pipeline.
// Usage: node scripts/test-intel.mjs "<city>"
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
  if (m) env[m[1]] = m[2];
}

const city = process.argv[2] || "Jaipur";
console.log("=== Testing pipeline for:", city, "===\n");

// 1. Reddit: try several endpoints / UAs to see what works
async function tryReddit(label, url, headers) {
  try {
    const res = await fetch(url, { headers });
    const body = await res.text();
    let n = -1;
    try {
      n = (JSON.parse(body)?.data?.children || []).length;
    } catch {}
    console.log(`Reddit [${label}] status=${res.status} posts=${n}`);
    return n;
  } catch (e) {
    console.log(`Reddit [${label}] FAILED:`, e.message);
    return -1;
  }
}

const q = encodeURIComponent(`${city} (scam OR "tourist trap" OR taxi OR overcharg OR ATM)`);
await tryReddit("www+script-ua", `https://www.reddit.com/search.json?q=${q}&sort=relevance&t=year&limit=25&raw_json=1`, {
  "User-Agent": "TravelRadar/1.0 (travel safety research)",
  Accept: "application/json",
});
await tryReddit("www+browser-ua", `https://www.reddit.com/search.json?q=${q}&sort=relevance&t=year&limit=25&raw_json=1`, {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  Accept: "application/json",
});
await tryReddit("old+script-ua", `https://old.reddit.com/search.json?q=${q}&sort=relevance&t=year&limit=25&raw_json=1`, {
  "User-Agent": "TravelRadar/1.0 (travel safety research)",
  Accept: "application/json",
});

// 2. Gemini: probe which models actually work with this key (with retries for 503)
const key = env.GEMINI_API_KEY;
// Keep this list in sync with MODELS in src/lib/organize.js. Do not add
// retired model IDs (e.g. gemini-2.5-flash, gemini-2.0-flash, the
// gemini-3.x-flash phantom IDs) — they 404 immediately and waste 8+ seconds
// per probe.
const MODELS_TO_TRY = [
  env.GEMINI_MODEL,
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
].filter(Boolean);

let posts = [];
if (!key) {
  console.log("GEMINI_API_KEY missing!");
} else {
  const prompt = `Build a short travel-safety briefing for the city: ${city}
Return ONLY JSON (no markdown):
{"alerts":[{"name":"","severity":"high","description":"","avoid":""}],"tips":[{"name":"","description":"","avoid":""}]}
Exactly 12 alerts (severity high or medium) and 10 tips, all specific to ${city}.`;

  for (const model of MODELS_TO_TRY) {
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": key },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          },
        );
        const json = await res.json().catch(() => ({}));
        console.log(`Gemini ${model} attempt ${attempt} status:`, res.status);
        if (res.status === 503 || res.status === 429) {
          await new Promise((r) => setTimeout(r, 1500 * attempt));
          continue;
        }
        if (!res.ok) {
          console.log("  error:", json?.error?.message || "(none)");
          break;
        }
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const a = text.indexOf("{");
        const b = text.lastIndexOf("}");
        const parsed = JSON.parse(text.slice(a, b + 1));
        console.log(`  OK -> alerts: ${(parsed.alerts || []).length}, tips: ${(parsed.tips || []).length}`);
        (parsed.alerts || []).slice(0, 3).forEach((x) => console.log("  *", x.name));
        ok = true;
      } catch (e) {
        console.log(`Gemini ${model} attempt ${attempt} FAILED:`, e.message);
      }
    }
    if (ok) break;
  }
}


// 3. Open-Meteo geocoding (city-brief)
try {
  const res = await fetch(
    "https://geocoding-api.open-meteo.com/v1/search?count=1&name=" + encodeURIComponent(city),
  );
  const geo = await res.json();
  const hit = geo?.results?.[0];
  console.log("\nGeocoding:", hit ? `${hit.name}, ${hit.country} (${hit.country_code}) tz=${hit.timezone}` : "NOT FOUND");
} catch (e) {
  console.log("Geocoding FAILED:", e.message);
}
