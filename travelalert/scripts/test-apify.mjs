// Apify Reddit scraper probe — verifies the actor runs and shows the exact
// dataset field names so the mapping in src/lib/live-posts.js can be checked.
// Usage: node scripts/test-apify.mjs "<city>"   (needs APIFY_TOKEN in .env.local)
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
  if (m) env[m[1]] = m[2];
}

const token = env.APIFY_TOKEN || process.env.APIFY_TOKEN;
const actorId = env.APIFY_ACTOR_ID || process.env.APIFY_ACTOR_ID || "trudax~reddit-scraper-lite";
const maxPosts = Number(env.APIFY_MAX_POSTS || process.env.APIFY_MAX_POSTS || 40);
const city = process.argv[2] || "Jaipur";

if (!token) {
  console.log("Set APIFY_TOKEN in .env.local first (console.apify.com → Settings → API & Integrations).");
  process.exit(1);
}

console.log(`Running actor ${actorId} for "${city}" (maxPosts=${maxPosts})...\n`);

const query = `${city} (scam OR "tourist trap" OR taxi OR overcharg OR ATM)`;
const input = {
  searches: [query],
  posts: [],
  includeComments: false,
  includePostData: true,
  maxPosts,
  maxComments: 0,
  sort: "top",
};

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 120000);

const t0 = Date.now();
try {
  const res = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    }
  );
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log("HTTP status:", res.status, `in ${elapsed}s`);

  if (!res.ok) {
    console.log("Error body:", (await res.text()).slice(0, 500));
    process.exit(1);
  }

  const items = await res.json();
  console.log("Items returned:", Array.isArray(items) ? items.length : "(not an array!)");
  if (!Array.isArray(items) || items.length === 0) {
    console.log("No posts came back — try another city or check the actor's input schema on its Apify page.");
    process.exit(0);
  }

  console.log("\nRaw field names of first item:");
  console.log(" ", Object.keys(items[0]).join(", "));

  console.log("\nFirst 5 posts (title | sub | score):");
  for (const it of items.slice(0, 5)) {
    const title = it.title || it.postTitle || "(no title)";
    const sub = it.communityName || it.subreddit || it.sub || "?";
    const score = it.numberOfUpvotes ?? it.upvotes ?? it.score ?? "?";
    console.log(`  - ${String(title).slice(0, 70)} | r/${sub} | ${score}`);
  }

  const mapped = items
    .map((it) => ({
      ok: Boolean(it.title || it.postTitle),
      hasText: Boolean(it.body || it.text || it.selftext || it.selfText || it.content),
    }))
    .filter((m) => m.ok && m.hasText).length;
  console.log(`\nMapping check: ${mapped}/${items.length} items map cleanly to {title, text}.`);
  console.log("If this is low, paste the field names above so the mapper can be adjusted.");
} catch (err) {
  console.log("FAILED:", err?.message || err);
} finally {
  clearTimeout(timer);
}