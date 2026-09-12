import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  LockKeyhole,
  MapPin,
  Radar,
  ShieldCheck,
} from "lucide-react";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getScamCity, listScamCities, getRelatedCities } from "@/lib/scam-data";
import { findKnownCity } from "@/lib/dashboard-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://travelradar.live";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const cities = await listScamCities();
    return cities.map((c) => ({ city: c.slug }));
  } catch (err) {
    console.error("generateStaticParams failed:", err?.message || err);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { city: slug } = await params;
  const city = await getScamCity(slug);
  if (!city) {
    return { title: "Tourist Scam Guide" };
  }

  const year = new Date().getFullYear();
  const known = findKnownCity(city.name);
  const country = known?.name?.split(", ").slice(1).join(", ") || "";
  const title = `${city.name} Travel Scams ${year} — Real Alerts from Reddit`;
  const description =
    `${city.rawAlerts.length} active tourist scams reported in ${city.name}` +
    `${country ? `, ${country}` : ""} for ${year}. The top travel warnings and how to avoid them.`;

  return {
    title,
    description,
    alternates: { canonical: `/scams/${slug}` },
    keywords: [
      `${city.name} scams`,
      `${city.name} tourist scams`,
      `${city.name} travel safety`,
      `${city.name} taxi scam`,
      `is ${city.name} safe`,
    ],
    openGraph: {
      url: `/scams/${slug}`,
      title,
      description,
      type: "article",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function severityClass(severity) {
  return severity === "High Financial Risk"
    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300";
}

export default async function CityScamPage({ params }) {
  const { city: slug } = await params;
  const city = await getScamCity(slug);
  if (!city) notFound();

  const visibleAlerts = city.alerts.filter((a) => !a.gated);
  const gatedAlerts = city.alerts.filter((a) => a.gated);

  const known = findKnownCity(city.name);
  const country = known?.name?.split(", ").slice(1).join(", ") || "";
  const year = new Date().getFullYear();
  const signupHref = `/signup?city=${encodeURIComponent(city.name)}&redirect=/dashboard`;

  const relatedCities = await getRelatedCities(slug, 5);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: city.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${city.name} Tourist Scams (${year} Guide)`,
    description: city.intro,
    url: `${SITE_URL}/scams/${slug}`,
    datePublished: city.updatedAt
      ? new Date(city.updatedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    dateModified: city.updatedAt
      ? new Date(city.updatedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    author: { "@type": "Organization", name: "TravelRadar" },
    publisher: {
      "@type": "Organization",
      name: "TravelRadar",
      url: SITE_URL,
    },
    about: {
      "@type": "Place",
      name: city.name,
      ...(country
        ? { address: { "@type": "PostalAddress", addressCountry: country } }
        : {}),
    },
    articleSection: "Travel Safety",
    inLanguage: "en",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Scams", item: `${SITE_URL}/scams` },
      {
        "@type": "ListItem",
        position: 3,
        name: city.name,
        item: `${SITE_URL}/scams/${slug}`,
      },
    ],
  };

  return (
    <main className="min-h-svh bg-[#f7f8f8] text-zinc-950 transition-colors dark:bg-[#0c0c0e] dark:text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#0c0c0e]/90">
        <nav
          className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8"
          aria-label="Primary navigation"
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-sm font-bold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-xl bg-zinc-950 text-white">
              <Radar className="size-4" />
            </span>
            <span className="hidden sm:inline">TravelRadar</span>
          </Link>
          <div className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-500 sm:text-sm dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-950 dark:hover:text-white">Home</Link>
            <span className="mx-2 text-zinc-300 dark:text-zinc-600">›</span>
            <Link href="/scams" className="hover:text-zinc-950 dark:hover:text-white">Scams</Link>
            <span className="mx-2 text-zinc-300 dark:text-zinc-600">›</span>
            <span className="text-zinc-950 dark:text-zinc-100">{city.name}</span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-zinc-600 hover:text-zinc-950 sm:inline dark:text-zinc-400 dark:hover:text-white"
            >
              Log in
            </Link>
            <Link
              href={signupHref}
              className="rounded-full bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800 sm:text-sm"
            >
              Get Free Alerts
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>

      <header className="border-b border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0c0c0e]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              TRAVELER-REPORTED · UPDATED {year}
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.04em] text-zinc-950 sm:text-6xl lg:text-7xl dark:text-zinc-50">
              {city.name} Tourist Scams{" "}
              <span className="text-zinc-400 dark:text-zinc-500">&amp; Transit Traps</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg dark:text-zinc-400">
              {city.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-zinc-200 pt-5 text-xs font-semibold text-zinc-500 sm:text-sm dark:border-white/10 dark:text-zinc-400">
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-zinc-400 dark:text-zinc-500" />
                {city.name}
                {country ? `, ${country}` : ""}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="size-4 text-zinc-400 dark:text-zinc-500" />
                Updated: {year}
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                {city.alerts.length} active warnings
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
        <section aria-labelledby="free-alerts-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                Field notes / open access
              </p>
              <h2
                id="free-alerts-heading"
                className="mt-2 text-2xl font-black tracking-tight sm:text-3xl"
              >
                The alerts to know first
              </h2>
            </div>
            <span className="hidden text-sm font-semibold text-zinc-400 sm:block dark:text-zinc-500">
              01—{String(visibleAlerts.length).padStart(2, "0")} / {city.alerts.length}
            </span>
          </div>
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {visibleAlerts.map((alert, index) => (
              <article
                key={alert.title + index}
                className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_12px_35px_rgba(24,24,27,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(24,24,27,0.08)] sm:p-8 dark:border-white/10 dark:bg-[#16161b]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
                    {alert.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${severityClass(alert.severity)}`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-extrabold leading-tight tracking-tight text-zinc-950 sm:text-2xl dark:text-zinc-50">
                  {alert.title}
                </h3>
                <div className="mt-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                    The Trap
                  </p>
                  <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                    {alert.description}
                  </p>
                </div>
                <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                    <span className="grid size-5 place-items-center rounded-full bg-emerald-600 text-white">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    How to Avoid
                  </p>
                  <p className="mt-2 text-sm leading-7 text-emerald-950/75 dark:text-emerald-100/80">
                    {alert.prevention}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {gatedAlerts.length > 0 && (
          <section
            className="relative mt-16"
            aria-labelledby="locked-alerts-heading"
          >
            <div className="rounded-[2rem] border border-zinc-200 bg-zinc-100/80 p-5 sm:p-8 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    Restricted intelligence
                  </p>
                  <h2
                    id="locked-alerts-heading"
                    className="mt-2 text-2xl font-black tracking-tight sm:text-3xl"
                  >
                    {gatedAlerts.length} more active warnings
                  </h2>
                </div>
                <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-bold text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
                  {gatedAlerts.length} locked
                </span>
              </div>
              <div className="mt-7 grid gap-3 md:grid-cols-2">
                {gatedAlerts.map((alert, index) => (
                  <article
                    key={alert.title + index}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
                        <LockKeyhole className="size-4" />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                          Alert {String(index + visibleAlerts.length + 1).padStart(2, "0")} / {alert.category}
                        </p>
                        <h3 className="mt-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                          {alert.title}
                        </h3>
                      </div>
                    </div>
                    <p
                      className="pointer-events-none mt-4 select-none text-sm leading-6 text-zinc-500 dark:text-zinc-400"
                      style={{ filter: "blur(6px)" }}
                      aria-hidden="true"
                    >
                      {alert.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative mx-auto -mt-4 max-w-xl px-3 sm:-mt-8">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl shadow-zinc-950/20 sm:p-8">
                <div className="grid size-11 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                  <ShieldCheck className="size-6" />
                </div>
                <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
                  Unlock All {city.alerts.length} {city.name} Alerts
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Create a free account to read all active scam warnings and get
                  alert notifications for your travel dates.
                </p>
                <Link
                  href={signupHref}
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-center text-sm font-black text-zinc-950 transition hover:bg-emerald-300"
                >
                  Unlock {city.name} Safety Dossier (Free)
                  <ArrowRight className="size-4" />
                </Link>
                <p className="mt-4 text-center text-xs font-medium text-zinc-500">
                  No credit card required • Takes 10 seconds
                </p>
              </div>
            </div>
          </section>
        )}

        {relatedCities.length > 0 && (
          <section
            className="mt-16 border-t border-zinc-200 pt-10 dark:border-white/10"
            aria-labelledby="related-heading"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e5484a]">
                  Keep checking
                </p>
                <h2
                  id="related-heading"
                  className="mt-2 text-2xl font-black tracking-tight sm:text-3xl"
                >
                  Related destinations
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  Other cities travelers are scanning before they land.
                </p>
              </div>
            </div>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCities.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/scams/${c.slug}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-base font-bold text-zinc-950 shadow-[0_6px_20px_rgba(24,24,27,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(24,24,27,0.08)] dark:border-white/10 dark:bg-[#16161b] dark:text-zinc-100"
                  >
                    <span className="min-w-0 truncate">
                      {c.name} tourist scams
                    </span>
                    <span className="shrink-0 font-mono text-xs font-semibold text-[#e5484a]">
                      View guide →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section
          className="mx-auto mt-16 max-w-3xl border-t border-zinc-200 pt-10 dark:border-white/10"
          aria-labelledby="faq-heading"
        >
          <h2 id="faq-heading" className="text-2xl font-black tracking-tight">
            {city.name} scam FAQ
          </h2>
          <div className="mt-6 space-y-6">
            {city.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}