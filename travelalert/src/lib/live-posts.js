const UA = "TravelRadar/1.0 (travel safety research)";

// ---------------------------------------------------------------------------
// Primary source: Apify Reddit scraper.
// Reddit blocks direct server-side JSON requests (403), so an Apify actor is
// the reliable way to pull live traveler posts. Sign up at console.apify.com,
// add the chosen actor ("Try for free"), then set:
//   APIFY_TOKEN=apify_api_...
//   APIFY_ACTOR_ID=username~actor-name   (optional, default below)
//   APIFY_MAX_POSTS=40                   (optional)
// ---------------------------------------------------------------------------
const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_ACTOR_ID = (process.env.APIFY_ACTOR_ID || "trudax~reddit-scraper-lite").replace("/", "~");
const APIFY_MAX_POSTS = Math.max(10, Number(process.env.APIFY_MAX_POSTS || 40));
// A synchronous Apify actor can take more than a minute on a cold start. Keep
// enough time for the actor to finish instead of aborting a successful run.
const APIFY_TIMEOUT_MS = Math.max(5000, Number(process.env.APIFY_TIMEOUT_MS || 120000));
// The actor's README supports "Relevance", "Hot", "Top" and "New". "new" keeps
// the briefing live; "relevance" surfaces older-but-on-topic posts. If the
// actor rejects the requested sort, the run retries once with "relevance".
const APIFY_SORT = process.env.APIFY_SORT || "new";
// A post must reference the city plus at least one risk signal before it is
// worth feeding to the organizer. City in the title (3) + any risk word (1)
// clears the bar; city anywhere (2) + a multi-word risk phrase (2) does too.
export const MIN_RELEVANCE_SCORE = 4;
// Risk vocabulary used to score posts. Multi-word phrases score double because
// they are far less likely to be false positives.
const RISK_TERMS = [
  "scam",
  "scammed",
  "fraud",
  "tourist trap",
  "overcharg",
  "overpriced",
  "rip off",
  "ripoff",
  "rip-off",
  "theft",
  "stolen",
  "robbed",
  "snatch",
  "extortion",
  "tourist police",
  "tout",
  "unlicensed",
  "illegal",
  "taxi",
  "meter",
  "fare",
  "commission",
  "markup",
  "surcharge",
  "fake",
  "warning",
  "avoid",
  "unsafe",
  "dangerous",
  "deposit",
  "damage claim",
];

/** True when an item body is missing or just the actor's submit boilerplate. */
function isBoilerplate(text) {
  // Normalize HTML entities so real-world shapes like
  // "&#32; submitted by &#32; /u/name [link] &#32; [comments]" still match.
  const flat = String(text || "").replace(/&#?\w+;/g, " ");
  return !flat.trim() || /submitted by\s+\/u\//i.test(flat);
}

/** Minimal HTML-to-text fallback for actors that only fill the html field. */
function htmlToText(html) {
  if (!html) return "";
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|h[1-6]|div)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes a dataset item from any of the common Apify Reddit actors into
 * the { id, url, createdAt, title, text, sub, score } shape organizeCity
 * consumes. Field names differ slightly per actor (body/text/selftext,
 * numberOfUpvotes/score, ...), so every known variant is checked.
 */
export function mapApifyItem(item) {
  // The actor can return posts, comments, and subreddit/community records even
  // when comments are disabled. Only actual Reddit submissions are sources.
  if (item?.dataType !== "post") return null;
  const title = item?.title || item?.postTitle || "";
  if (!title) return null;

  let text = String(
    item?.body || item?.text || item?.selftext || item?.selfText || item?.content || ""
  ).trim();
  // Some actors leave only "submitted by /u/... [link] [comments]" in the body
  // while the readable content lives in html — fall back to html then.
  if (isBoilerplate(text)) {
    text = htmlToText(item?.html || item?.contentHtml || "");
  }

  const sub = String(
    item?.communityName ||
      item?.subreddit ||
      item?.sub ||
      item?.community?.name ||
      "travel"
  ).replace(/^r\//i, "");
  const score = Number(
    item?.numberOfUpvotes ?? item?.upvotes ?? item?.score ?? item?.numberOfLikes ?? 0
  );

  return {
    id: String(item?.parsedId || item?.id || item?.postId || ""),
    url: String(item?.url || ""),
    createdAt: item?.createdAt || item?.createdUtc || item?.timestamp || null,
    title: String(title).slice(0, 300),
    text: String(text).slice(0, 400),
    sub,
    score: Number.isFinite(score) ? score : 0,
  };
}

/**
 * Boundary-aware term match: stems like "overcharg" still match
 * "overcharging", but "fare" no longer matches "welfare".
 */
function containsTerm(hay, term) {
  if (term.includes(" ")) return hay.includes(term);
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}`).test(hay);
}

/** Scores how useful a post is for a city briefing. Higher = more relevant. */
export function relevanceScore(post, city) {
  const titleText = String(post.title || "").toLowerCase();
  const hay = `${titleText} ${String(post.text || "").toLowerCase()}`;
  const cityTerms = String(city || "")
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/[^a-z\u00c0-\u024f]/g, ""))
    .filter((term) => term.length >= 3);

  let score = 0;
  const cityInTitle = cityTerms.some((term) => titleText.includes(term));
  const cityAnywhere = cityTerms.some((term) => containsTerm(hay, term));
  if (cityInTitle) score += 3;
  else if (cityAnywhere) score += 2;

  for (const term of RISK_TERMS) {
    if (containsTerm(hay, term)) score += term.includes(" ") ? 2 : 1;
  }

  // Travel/destination subreddits are a strong signal of traveler context.
  if (/(travel|visit|tourism|backpacking|solotravel|digitalnomad)/i.test(String(post.sub || ""))) {
    score += 1;
  }

  return score;
}

/** Removes duplicate posts by Reddit id, URL, or normalized title. */
export function dedupePosts(posts) {
  const seen = new Set();
  const out = [];
  for (const post of posts) {
    const normTitle = String(post.title || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    const keys = [post.id, post.url, normTitle].filter(Boolean);
    if (keys.length === 0 || keys.some((key) => seen.has(key))) continue;
    for (const key of keys) seen.add(key);
    out.push(post);
  }
  return out;
}

async function fetchPostsViaApify(city) {
  if (!APIFY_TOKEN) {
    console.warn("apify.skip", { city, reason: "APIFY_TOKEN not set" });
    return { posts: null, error: "APIFY_TOKEN not set" };
  }

  // Reddit search treats parentheses + OR as a group. Queries are scoped to
  // the city plus one family of risk language, and deliberately kept to four:
  // every extra search slows the sync actor run toward the briefing timeout.
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
    maxPosts: APIFY_MAX_POSTS,
    // This actor validates maxComments even when comments are disabled.
    maxComments: 1,
    sort: APIFY_SORT,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), APIFY_TIMEOUT_MS);

  const runRequest = () =>
    fetch(`https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${APIFY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: controller.signal,
      cache: "no-store",
    });

  try {
    console.info("apify.request", {
      city,
      actor: APIFY_ACTOR_ID,
      maxPosts: APIFY_MAX_POSTS,
      sort: input.sort,
      timeoutMs: APIFY_TIMEOUT_MS,
    });
    let res = await runRequest();

    // If the actor rejects the requested sort (e.g. "new"), fall back to the
    // documented "relevance" once instead of failing the whole pipeline.
    if (!res.ok && input.sort !== "relevance") {
      console.info("apify.sort_retry", {
        city,
        from: input.sort,
        to: "relevance",
        status: res.status,
      });
      input.sort = "relevance";
      res = await runRequest();
    }

    if (!res.ok) {
      const error = `HTTP ${res.status}`;
      console.error("apify.response_error", { city, actor: APIFY_ACTOR_ID, error });
      return { posts: null, error };
    }

    const items = await res.json().catch(() => null);
    if (!Array.isArray(items)) {
      console.error("apify.unexpected_payload");
      return { posts: null, error: "apify payload was not an array" };
    }

    const postItems = items.filter((item) => item?.dataType === "post");
    const mapped = postItems.map(mapApifyItem).filter(Boolean);
    const deduped = dedupePosts(mapped);
    const relevantPosts = deduped
      .filter((post) => relevanceScore(post, city) >= MIN_RELEVANCE_SCORE)
      // Newest first so the digest prioritizes the most recent reports.
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    console.info("apify.response", {
      city,
      itemCount: items.length,
      postItems: postItems.length,
      mappedPosts: mapped.length,
      dedupedPosts: deduped.length,
      relevantPosts: relevantPosts.length,
    });
    if (!relevantPosts.length) {
      console.warn("apify.no_relevant_posts", { city, itemCount: items.length, postItems: postItems.length });
      return { posts: null, error: "apify returned no relevant posts" };
    }
    return { posts: relevantPosts, error: null };
  } catch (err) {
    const error = err?.name === "AbortError" ? "timeout" : err?.message || "request failed";
    console.error("apify.request_failed", { city, actor: APIFY_ACTOR_ID, error });
    return { posts: null, error };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Fallback source: Reddit OAuth app (script) credentials, then public JSON.
// ---------------------------------------------------------------------------
const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

let tokenCache = { token: null, expiresAt: 0 };

async function getRedditToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) return null;
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  if (!json?.access_token) return null;
  const ttl = Math.max(60, (json.expires_in || 3600) - 300);
  tokenCache = { token: json.access_token, expiresAt: Date.now() + ttl * 1000 };
  return tokenCache.token;
}

function mapChildren(children) {
  return (children || [])
    .map((c) => ({
      title: c.data?.title || c.title || "",
      text: String(c.data?.selftext || c.selftext || "").slice(0, 400),
      sub: c.data?.subreddit || c.subreddit || "travel",
      score: c.data?.score || c.score || 0,
    }))
    .filter((p) => p.title);
}

async function redditSearch(city, t) {
  const q = encodeURIComponent(
    `${city} (scam OR "tourist trap" OR taxi OR overcharg OR ATM)`
  );

  const token = await getRedditToken().catch(() => null);
  const base = token ? "https://oauth.reddit.com" : "https://www.reddit.com";
  const url = `${base}/search.json?q=${q}&sort=relevance&t=${t}&limit=25&raw_json=1`;

  const headers = { "User-Agent": UA, Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return mapChildren(json?.data?.children);
}

async function fetchPostsViaRedditApi(city) {
  const windows = ["week", "month", "year", "all"];
  let posts = [];
  let windowUsed = "none";

  for (const t of windows) {
    try {
      posts = await redditSearch(city, t);
    } catch {
      posts = [];
    }
    if (posts.length >= 5) {
      windowUsed = t;
      break;
    }
  }

  return { posts, window: windowUsed };
}

/**
 * Live traveler posts for a city. Priority:
 *   1. Apify actor (most reliable from servers)
 *   2. Reddit API with OAuth creds
 *   3. Public Reddit JSON (usually 403-blocked)
 * Returns { posts, window, live, mode, apifyError }.
 * 
 * If Apify times out or fails, return empty posts so the briefing can fall back
 * to city-specific seed data without failing the dashboard request.
 */
export async function fetchLivePosts(city) {
  // Create a timeout wrapper that resolves quickly on failure
  const apify = await Promise.race([
    fetchPostsViaApify(city),
    new Promise((resolve) => 
      setTimeout(() => resolve({ posts: null, error: "timeout" }), APIFY_TIMEOUT_MS + 1000)
    )
  ]);

  // Accept even a small valid sample: for less-discussed cities, a handful of
  // genuine reports beats dropping back to static seed content.
  if (apify.posts && apify.posts.length >= 1) {
    console.info("live-posts.source", { city, source: "apify", posts: apify.posts.length });
    return {
      posts: apify.posts,
      window: "apify",
      live: true,
      mode: "apify",
      apifyError: null,
    };
  }

  // Direct Reddit is normally 403-blocked from server hosts. Do not add four
  // more network attempts after an Apify timeout unless OAuth is configured.
  const canUseRedditOauth = Boolean(CLIENT_ID && CLIENT_SECRET);
  const reddit = canUseRedditOauth
    ? await fetchPostsViaRedditApi(city)
    : { posts: [], window: "none" };

  if (reddit.posts.length >= (apify.posts?.length || 0)) {
    console.info("live-posts.source", {
      city,
      source: reddit.posts.length ? "reddit" : "none",
      posts: reddit.posts.length,
      apifyError: apify.error || null,
    });
    return {
      posts: reddit.posts,
      window: reddit.window,
      live: reddit.posts.length > 0,
      mode: reddit.posts.length ? "reddit" : "none",
      apifyError: null, // Don't propagate Apify errors to client
    };
  }

  return {
    posts: apify.posts || [],
    window: "apify",
    live: (apify.posts || []).length > 0,
    mode: "apify",
    apifyError: null, // Don't propagate Apify errors to client
  };
}