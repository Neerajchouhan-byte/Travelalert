import { listScamCities } from "@/lib/scam-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://travelradar.live";

export default async function sitemap() {
  const now = new Date();

  // Static, indexable pages only. /dashboard, /profile, /login, /signup, and
  // /api are deliberately excluded — they're either auth-gated or non-HTML.
  const staticRoutes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/scams", priority: 0.8, changeFrequency: "weekly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" },
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Every cached city becomes a destination page. New cities added by the
  // pre-cache pipeline (or by real user searches) show up here on the next
  // build without any code change.
  let cityRoutes = [];
  try {
    const cities = await listScamCities();
    cityRoutes = cities.map((c) => ({
      url: `${SITE_URL}/scams/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.9,
    }));
  } catch (err) {
    console.error("sitemap: listScamCities failed:", err?.message || err);
  }

  return [...staticRoutes, ...cityRoutes];
}