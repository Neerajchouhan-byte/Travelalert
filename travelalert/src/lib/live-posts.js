const UA = "TravelRadar/1.0 (travel safety research)";

// Optional Reddit script-app credentials. Reddit blocks anonymous server-side
// JSON requests from most hosts (403), so OAuth app-only credentials are the
// reliable path. Create a free app at https://www.reddit.com/prefs/apps
// and set REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET.
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

export async function fetchLivePosts(city) {
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

  return { posts, window: windowUsed, live: posts.length > 0 };
}