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
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID || "trudax~reddit-scraper-lite";
const APIFY_MAX_POSTS = Math.max(10, Number(process.env.APIFY_MAX_POSTS || 40));
// Dashboard scans must respond quickly. A cold Apify actor can take minutes,
// so use live posts only when the actor is already warm; Gemini still creates
// a city-specific briefing when this short live-data budget expires.
const APIFY_TIMEOUT_MS = Math.max(3000, Number(process.env.APIFY_TIMEOUT_MS || 12000));

/**
 * Normalizes a dataset item from any of the common Apify Reddit actors into
 * the { title, text, sub, score } shape organizeCity consumes. Field names
 * differ slightly per actor (body/text/selftext, numberOfUpvotes/score, ...),
 * so every known variant is checked.
 */
function mapApifyItem(item) {
  // Some actors emit comments/mixed rows too — keep posts only when flagged.
  if (item?.dataType && !/post|thread|link/i.test(String(item.dataType))) return null;
  const title = item?.title || item?.postTitle || "";
  if (!title) return null;
  const text = String(
    item?.body || item?.text || item?.selftext || item?.selfText || item?.content || ""
  ).slice(0, 400);
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
    title: String(title).slice(0, 300),
    text,
    sub,
    score: Number.isFinite(score) ? score : 0,
  };
}

async function fetchPostsViaApify(city) {
  if (!APIFY_TOKEN) return { posts: null, error: "APIFY_TOKEN not set" };

  const query = `${city} (scam OR "tourist trap" OR taxi OR overcharg OR ATM)`;
  const input = {
    searches: [query],
    posts: [],
    includeComments: false,
    includePostData: true,
    maxPosts: APIFY_MAX_POSTS,
    maxComments: 0,
    sort: "top",
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), APIFY_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${APIFY_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
        signal: controller.signal,
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 160);
      console.error("apify.run_failed", { status: res.status, detail });
      return { posts: null, error: `apify ${res.status}` };
    }

    const items = await res.json().catch(() => null);
    if (!Array.isArray(items)) {
      console.error("apify.unexpected_payload");
      return { posts: null, error: "apify payload was not an array" };
    }

    const posts = items.map(mapApifyItem).filter(Boolean);
    if (!posts.length) {
      console.warn("apify.no_mapped_posts", { itemCount: items.length });
      return { posts: null, error: "apify returned no usable posts" };
    }
    return { posts, error: null };
  } catch (err) {
    console.error("apify.request_failed", { message: err?.message || String(err) });
    return { posts: null, error: err?.message || "apify request failed" };
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
 */
export async function fetchLivePosts(city) {
  const apify = await fetchPostsViaApify(city);

  if (apify.posts && apify.posts.length >= 5) {
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
    return {
      posts: reddit.posts,
      window: reddit.window,
      live: reddit.posts.length > 0,
      mode: reddit.posts.length ? "reddit" : "none",
      apifyError: apify.error || null,
    };
  }

  return {
    posts: apify.posts || [],
    window: "apify",
    live: (apify.posts || []).length > 0,
    mode: "apify",
    apifyError: apify.error || null,
  };
}