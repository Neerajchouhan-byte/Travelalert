import Link from "next/link";
import { Radar } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { listScamCities } from "@/lib/scam-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://travelradar.live";

export const metadata = {
  title: "Tourist Scam Guides by City",
  description:
    "Traveler-reported tourist scam alerts and transit traps for popular destinations. Browse city-by-city guides built from real traveler reports.",
  alternates: { canonical: "/scams" },
  openGraph: {
    url: "/scams",
    title: "Tourist Scam Guides by City — TravelRadar",
    description:
      "Traveler-reported tourist scam alerts and transit traps for popular destinations.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tourist Scam Guides by City — TravelRadar",
    description:
      "Traveler-reported tourist scam alerts and transit traps for popular destinations.",
  },
};

export const revalidate = 3600;

export default async function ScamsIndexPage() {
  const cities = await listScamCities();

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tourist Scam Guides by City",
    description:
      "Traveler-reported tourist scam alerts and transit traps for popular destinations.",
    url: `${SITE_URL}/scams`,
    hasPart: cities.map((c) => ({
      "@type": "Article",
      headline: `${c.name} Tourist Scams`,
      url: `${SITE_URL}/scams/${c.slug}`,
    })),
  };

  return (
    <main className="min-h-svh bg-[#f7f8f8] text-zinc-950 transition-colors dark:bg-[#0c0c0e] dark:text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <div className="border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#0c0c0e]/90">
        <nav
          className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-8"
          aria-label="Primary navigation"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-xl bg-zinc-950 text-white">
              <Radar className="size-4" />
            </span>
            <span>TravelRadar</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-zinc-600 hover:text-zinc-950 sm:inline dark:text-zinc-400 dark:hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800 sm:text-sm"
            >
              Get started
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5484a]">
          TravelRadar / Scam intelligence
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
          Tourist scam guides by city.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Traveler-reported warnings and practical prevention advice before
          you land.
        </p>

        {cities.length > 0 ? (
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {cities.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/scams/${c.slug}`}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-base font-bold text-zinc-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#16161b] dark:text-zinc-100"
                >
                  <span>{c.name}</span>
                  <span className="font-mono text-xs font-semibold text-[#e5484a]">
                    View guide →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">
            Guides are being prepared. Check back soon.
          </p>
        )}
      </div>
    </main>
  );
}