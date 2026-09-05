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
  const url = `https://www.reddit.com/search.json?q=${q}&sort=relevance&t=${t}&limit=25&raw_json=1`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "TravelRadar/1.0 (travel safety research)",
      Accept: "application/json",
    },
    cache: "no-store",
  });
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