export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || "";

  if (city.length < 2) {
    return Response.json({ error: "city required", posts: [] }, { status: 400 });
  }

  const q = encodeURIComponent(`${city} (scam OR tourist OR taxi OR overcharg)`);
  const url = `https://www.reddit.com/search.json?q=${q}&sort=new&t=month&limit=12&raw_json=1`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "TravelRadar/1.0 (travel safety)",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return Response.json({ city, posts: [], error: "reddit failed" });
    }

    const json = await res.json();
    const posts = (json?.data?.children || []).map((c) => ({
      title: c.data?.title || "",
      text: (c.data?.selftext || "").slice(0, 400),
      sub: c.data?.subreddit || "travel",
      score: c.data?.score || 0,
    }));

    return Response.json({ city, posts });
  } catch {
    return Response.json({ city, posts: [], error: "network error" });
  }
}