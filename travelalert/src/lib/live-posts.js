/**
 * Real Reddit Extractor via Google Index
 * Fetches genuine traveler complaints, URLs, and upvotes in ~250ms.
 *
 * The query is built in three escalating passes:
 *   1. Whitelisted travel + city subreddits, scam-keyword-scoped.
 *   2. All of reddit.com, scam-keyword-scoped (if pass 1 was thin).
 *   3. Loose "travel (scam OR warning OR tip)" (if pass 2 was thin).
 *
 * All three passes go through a single Serper search closure so the retry
 * logic and API key handling live in one place.
 */

import { getSubredditForCity } from "./subreddits.js";

// Helper to extract upvote counts often found in Google's Reddit snippets (e.g. "140 votes", "85 upvotes")
function extractUpvotes(text) {
  const match = String(text || "").match(/(\d+[\d,]*)\s*(?:votes|upvotes|points)/i);
  if (match) return parseInt(match[1].replace(/,/g, ""), 10);
  return null;
}

// Expanded keyword set — catches posts that don't literally say "scam"
const SCAM_KEYWORDS = [
  'scam', '"tourist trap"', 'pickpocket', 'overcharged', 'taxi',
  '"ripped off"', 'fake', 'avoid', 'warning', 'fraud', 'swindle',
  'cheated', '"con artist"', '"be careful"', 'sketchy', '"watch out"',
  'dodgy', '"common scam"'
];

// Expanded subreddit set — more ground-level scam reports than r/travel
const GENERAL_SUBS = [
  'travel', 'solotravel', 'backpacking', 'shoestring', 'scams',
  'IsItBullshit', 'digitalnomad', 'onebag'
];

function buildSubredditQuery(citySubreddit) {
  const subs = citySubreddit ? [...GENERAL_SUBS, citySubreddit] : GENERAL_SUBS;
  return subs.map((s) => `site:reddit.com/r/${s}`).join(" OR ");
}

function buildKeywordQuery() {
  return `(${SCAM_KEYWORDS.join(" OR ")})`;
}

function buildScamQuery(city, citySubreddit) {
  return `${buildSubredditQuery(citySubreddit)} "${city}" ${buildKeywordQuery()}`;
}

function dedupeByUrl(results) {
  const seen = new Set();
  return results.filter((r) => {
    if (seen.has(r.link)) return false;
    seen.add(r.link);
    return true;
  });
}

/**
 * Runs one Serper query and returns the organic results array (or [] on any
 * failure). Kept as a plain async function so searchCityScams can call it
 * multiple times with different queries.
 */
async function serperSearch(query, apiKey) {
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: 7 }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`[LiveReddit] Search error: ${response.status} (query: ${query.slice(0, 80)}...)`);
    return [];
  }

  const data = await response.json();
  return data.organic || [];
}

/**
 * Widens the search automatically if the first pass comes back thin.
 * Returns a deduped array of Serper organic results.
 */
async function searchCityScams(city, citySubreddit, apiKey, minResults = 3) {
  let results = await serperSearch(buildScamQuery(city, citySubreddit), apiKey);

  if (results.length < minResults) {
    // Pass 2: drop the subreddit whitelist, keep keywords, search all of reddit.com
    const broadQuery = `site:reddit.com "${city}" ${buildKeywordQuery()}`;
    const broad = await serperSearch(broadQuery, apiKey);
    results = dedupeByUrl([...results, ...broad]);
  }

  if (results.length < minResults) {
    // Pass 3: last resort — loosest possible query, still on-topic
    const fallbackQuery = `site:reddit.com "${city}" travel (scam OR warning OR tip)`;
    const fallback = await serperSearch(fallbackQuery, apiKey);
    results = dedupeByUrl([...results, ...fallback]);
  }

  return results;
}

export async function fetchLivePosts(city) {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    console.warn("[LiveReddit] SERPER_API_KEY is not set. Falling back to seed data.");
    return { posts: [], mode: "none" };
  }

  const citySubreddit = getSubredditForCity(city);
  console.info(`[LiveReddit] Querying real Reddit threads for ${city}...`);
  const t0 = Date.now();

  try {
    const results = await searchCityScams(city, citySubreddit, apiKey);

    const realPosts = results
      .filter((item) => item.link && item.link.includes("reddit.com"))
      .map((item) => {
        const subMatch = item.link.match(/r\/([a-zA-Z0-9_]+)/);
        const sub = subMatch ? `r/${subMatch[1]}` : "r/travel";
        const snippet = item.snippet || "";

        return {
          title: item.title ? item.title.replace(/\s*:\s*r\/.*$/, "").trim() : "",
          text: snippet,
          url: item.link,
          sub,
          upvotes: extractUpvotes(snippet),
        };
      });

    console.info(
      `[LiveReddit] Retrieved ${realPosts.length} real Reddit threads in ${Date.now() - t0}ms!`,
    );

    return {
      posts: realPosts,
      live: realPosts.length > 0,
      mode: "reddit-live",
    };
  } catch (err) {
    console.error("[LiveReddit] Fetch failed:", err);
    return { posts: [], mode: "error" };
  }
}