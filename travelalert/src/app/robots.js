export default function robots() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://travelradar.live";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/profile",
          "/api",
          "/login",
          "/signup",
          "/auth/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}