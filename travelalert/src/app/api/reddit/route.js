export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || "";

  if (city.length < 2) {
    return Response.json({ error: "city required", posts: [] }, { status: 400 });
  }

  const windows = ["week", "month", "year", "all"];
  const q = encodeURIComponent(
    `${city} (scam OR tourist OR taxi OR overcharg OR "tourist trap")`
  );

  const headers = {
    "User-Agent": "TravelRadar/1.0 (travel safety)",
    Accept: "application/json",
  };

  async function search(t) {
    const url = `https://www.reddit.com/search.json?q=${q}&sort=relevance&t=${t}&limit=25&raw_json=1`;
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.children || [])
      .map((c) => ({
        title: c.data?.title || "",
        text: (c.data?.selftext || "").slice(0, 400),
        sub: c.data?.subreddit || "travel",
        score: c.data?.score || 0,
        created: c.data?.created_utc || 0,
      }))
      .filter((p) => p.title);
  }

  try {
    let posts = [];
    let windowUsed = "";

    for (const t of windows) {
      posts = await search(t);
      if (posts.length >= 3) {
        windowUsed = t;
        break;
      }
    }

    // last attempt already ran "all"; keep whatever we got
    if (!windowUsed && posts.length) windowUsed = "all";

    return Response.json({
      city,
      posts,
      window: windowUsed || "none",
    });
  } catch {
    return Response.json({ city, posts: [], error: "network error" });
  }
}