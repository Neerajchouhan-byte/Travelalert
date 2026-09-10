import { scamCities } from "@/lib/scam-data";

export default function sitemap() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://travelradar.live";
  const now = new Date();
  const staticRoutes = ["/", "/scams", "/pricing", "/terms", "/privacy"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "/" ? 1.0 : 0.6,
  }));
  const cityRoutes = Object.values(scamCities).map((c) => ({
    url: `${base}/scams/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  return [...staticRoutes, ...cityRoutes];
}