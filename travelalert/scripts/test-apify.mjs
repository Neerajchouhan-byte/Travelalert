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
const actorId = (env.APIFY_ACTOR_ID || process.env.APIFY_ACTOR_ID || "trudax~reddit-scraper-lite").replace("/", "~");
const maxPosts = Number(env.APIFY_MAX_POSTS || process.env.APIFY_MAX_POSTS || 40);
const city = process.argv[2] || "Jaipur";

if (!token) {
  console.log("Set APIFY_TOKEN in .env.local first (console.apify.com → Settings → API & Integrations).");
  process.exit(1);
}

console.log(`Running actor ${actorId} for "${city}" (maxPosts=${maxPosts})...\n`);

// Reuse the production pipeline helpers so this probe reflects real behavior.
process.env.APIFY_TOKEN = token || "";
const { mapApifyItem, relevanceScore, dedupePosts, MIN_RELEVANCE_SCORE } = await import(
  "../src/lib/live-posts.js"
);

// Mirrors the production queries in src/lib/live-posts.js.
const searches = [
  `"${city}" (scam OR scammed OR fraud OR fake OR "tourist trap" OR tout)`,
  `"${city}" (overcharged OR overcharging OR overpriced OR "rip off" OR ripoff OR markup OR surcharge OR commission OR deposit OR "damage claim")`,
  `"${city}" (taxi OR meter OR fare OR pickpocket)`,
  `"${city}" (theft OR stolen OR robbed OR snatch OR robbery OR unlicensed OR illegal OR extortion OR avoid OR warning OR unsafe OR dangerous OR "tourist police")`,
];
const input = {
  searches,
  posts: [],
  includeComments: false,
  includePostData: true,
  maxPosts,
  maxComments: 1,
  sort: env.APIFY_SORT || "new",
};

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 120000);

const runRequest = () =>
  fetch(`https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    signal: controller.signal,
  });

const t0 = Date.now();
try {
  let res = await runRequest();
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log("HTTP status:", res.status, `in ${elapsed}s (sort=${input.sort})`);

  // Retry once with the documented "relevance" if the chosen sort is rejected.
  if (!res.ok && input.sort !== "relevance") {
    console.log(`sort="${input.sort}" was rejected — retrying with "relevance"...`);
    input.sort = "relevance";
    res = await runRequest();
    const elapsed2 = ((Date.now() - t0) / 1000).toFixed(1);
    console.log("HTTP status:", res.status, `in ${elapsed2}s (sort=${input.sort})`);
  }

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

  // Same pipeline as production: map → dedupe → relevance-score → newest first.
  const postItems = items.filter((it) => it?.dataType === "post");
  const mapped = postItems.map(mapApifyItem).filter(Boolean);
  const deduped = dedupePosts(mapped);
  const relevant = deduped
    .filter((p) => relevanceScore(p, city) >= MIN_RELEVANCE_SCORE)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  console.log(
    `\nPipeline check: ${postItems.length} posts → ${mapped.length} mapped → ` +
      `${deduped.length} deduped → ${relevant.length} relevant (min score ${MIN_RELEVANCE_SCORE}).`
  );
  for (const p of relevant.slice(0, 8)) {
    console.log(`  [${relevanceScore(p, city)}] r/${p.sub} | ${p.title.slice(0, 70)} | ${p.createdAt || "no date"}`);
  }
} catch (err) {
  console.log("FAILED:", err?.message || err);
} finally {
  clearTimeout(timer);
}