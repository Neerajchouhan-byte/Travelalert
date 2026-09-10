import Link from "next/link";
import { ArrowRight, Check, Clock3, LockKeyhole, MapPin, Radar, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { getScamCity } from "@/lib/scam-data";

export async function generateMetadata({ params }) {
  const { city: slug } = await params;
  const city = getScamCity(slug);
  if (!city) return { title: "Tourist Scam Guide | TravelRadar" };
  return {
    title: `${city.name} Tourist Scams (2026 Guide) - What to Avoid`,
    description: `Verified active tourist scams and transit traps in ${city.name} for 2026. Avoid airport taxi overcharging, temple touts, and tourist traps.`,
  };
}

function severityClass(severity) {
  return severity === "High Financial Risk"
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

export default async function CityScamPage({ params }) {
  const { city: slug } = await params;
  const city = getScamCity(slug);
  if (!city) notFound();

  const visibleAlerts = city.alerts.filter((alert) => !alert.gated);
  const gatedAlerts = city.alerts.filter((alert) => alert.gated);
  const signupHref = `/signup?city=${encodeURIComponent(city.slug)}&redirect=/dashboard`;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: city.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <main className="min-h-svh bg-[#f7f8f8] text-zinc-950">
      <div className="border-b border-zinc-200/80 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8" aria-label="Primary navigation">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-sm font-bold tracking-tight text-zinc-950"><span className="grid size-8 place-items-center rounded-xl bg-zinc-950 text-white"><Radar className="size-4" /></span><span className="hidden sm:inline">TravelRadar</span></Link>
          <div className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-500 sm:text-sm"><Link href="/" className="hover:text-zinc-950">Home</Link><span className="mx-2 text-zinc-300">›</span><span>Scams</span><span className="mx-2 text-zinc-300">›</span><span className="text-zinc-950">{city.name}</span></div>
          <div className="flex shrink-0 items-center gap-3"><Link href="/login" className="hidden text-sm font-semibold text-zinc-600 hover:text-zinc-950 sm:inline">Log in</Link><Link href={signupHref} className="rounded-full bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800 sm:text-sm">Get Free Alerts</Link></div>
        </nav>
      </div>

      <header className="border-b border-zinc-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8"><div className="max-w-4xl"><div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" />LIVE ADVISORY • VERIFIED FOR 2026</div><h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.04em] text-zinc-950 sm:text-6xl lg:text-7xl">{city.name} Tourist Scams <span className="text-zinc-400">&amp; Transit Traps</span></h1><p className="mt-6 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">Active street-level scams, unmetered taxi routes, and temple touts verified by recent travelers. Stay informed before landing.</p><div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-zinc-200 pt-5 text-xs font-semibold text-zinc-500 sm:text-sm"><span className="inline-flex items-center gap-2"><MapPin className="size-4 text-zinc-400" />{city.name}, {city.country}</span><span className="inline-flex items-center gap-2"><Clock3 className="size-4 text-zinc-400" />Updated: March 2026</span><span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-600" />Risk Level: Moderate (Transit/Touts)</span></div></div></div></header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
        <section aria-labelledby="free-alerts-heading"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Field notes / open access</p><h2 id="free-alerts-heading" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">The five alerts to know first</h2></div><span className="hidden text-sm font-semibold text-zinc-400 sm:block">01—05 / 12</span></div><div className="mt-7 grid gap-5 lg:grid-cols-2">{visibleAlerts.map((alert, index) => <article key={alert.title} className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_12px_35px_rgba(24,24,27,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(24,24,27,0.08)] sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-zinc-500">{alert.category}</span><div className="flex items-center gap-2"><span className="text-xs font-bold text-zinc-400">0{index + 1}</span><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${severityClass(alert.severity)}`}>{alert.severity}</span></div></div><h3 className="mt-6 text-xl font-extrabold leading-tight tracking-tight text-zinc-950 sm:text-2xl">{alert.title}</h3><div className="mt-6"><p className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400">The Trap</p><p className="mt-2 text-sm leading-7 text-zinc-600">{alert.description}</p></div><div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700"><span className="grid size-5 place-items-center rounded-full bg-emerald-600 text-white"><Check className="size-3" strokeWidth={3} /></span>How to Avoid</p><p className="mt-2 text-sm leading-7 text-emerald-950/75">{alert.prevention}</p></div></article>)}</div></section>

        <section className="relative mt-16" aria-labelledby="locked-alerts-heading"><div className="rounded-[2rem] border border-zinc-200 bg-zinc-100/80 p-5 sm:p-8"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Restricted intelligence</p><h2 id="locked-alerts-heading" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Seven more active warnings</h2></div><span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-bold text-zinc-500">7 locked</span></div><div className="mt-7 grid gap-3 md:grid-cols-2">{gatedAlerts.map((alert, index) => <article key={alert.title} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/70 p-5"><div className="flex items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-500"><LockKeyhole className="size-4" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Alert {String(index + 6).padStart(2, "0")} / {alert.category}</p><h3 className="mt-1 text-sm font-bold text-zinc-800">{alert.title}</h3></div></div><p className="pointer-events-none mt-4 select-none text-sm leading-6 text-zinc-500" style={{ filter: "blur(6px)" }} aria-hidden="true">{alert.description}</p></article>)}</div></div><div className="relative mx-auto -mt-4 max-w-xl px-3 sm:-mt-8"><div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl shadow-zinc-950/20 sm:p-8"><div className="grid size-11 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300"><ShieldCheck className="size-6" /></div><h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">Unlock All 12 Verified {city.name} Alerts</h2><p className="mt-3 text-sm leading-7 text-zinc-400">Create a free account to read all active scam warnings and get alert notifications for your travel dates.</p><Link href={signupHref} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-center text-sm font-black text-zinc-950 transition hover:bg-emerald-300">Unlock {city.name} Safety Dossier (Free)<ArrowRight className="size-4" /></Link><p className="mt-4 text-center text-xs font-medium text-zinc-500">No credit card required • Takes 10 seconds</p></div></div></section>

        <section className="mx-auto mt-16 max-w-3xl border-t border-zinc-200 pt-10" aria-labelledby="faq-heading"><h2 id="faq-heading" className="text-2xl font-black tracking-tight">
          {city.name} scam FAQ
        </h2><div className="mt-6 space-y-6">{city.faqs.map((faq) => <div key={faq.question}><h3 className="font-bold text-zinc-900">{faq.question}</h3><p className="mt-2 text-sm leading-7 text-zinc-600">{faq.answer}</p></div>)}</div></section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  );
}