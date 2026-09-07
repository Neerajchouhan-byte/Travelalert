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

export default async function CityScamPage({ params }) {
  const { city: slug } = await params;
  const city = getScamCity(slug);
  if (!city) notFound();

  const visibleAlerts = city.alerts.filter((alert) => !alert.gated);
  const gatedAlerts = city.alerts.filter((alert) => alert.gated);
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
    <main className="min-h-svh bg-[#07070a] px-4 py-10 text-[#f3f3f2] sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-3xl">
          <p className="inline-flex rounded-full border border-[#3ecf8e]/30 bg-[#3ecf8e]/10 px-3 py-1 text-xs font-semibold text-[#8de5bd]">Updated March 2026 • Verified Local Advisories</p>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#e5484a]">TravelRadar / {city.country}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">{city.name} Tourist Scams</h1>
          <p className="mt-5 text-lg leading-8 text-[#a6a6ad]">The 2026 guide to active tourist scams, transit traps, and simple ways to avoid paying for someone else&apos;s hustle.</p>
        </header>

        <section className="mt-12 grid gap-4 md:grid-cols-2" aria-label="Verified scam alerts">
          {visibleAlerts.map((alert, index) => (
            <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-6" key={alert.title}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e5484a]">Alert {String(index + 1).padStart(2, "0")} / verified</p>
              <h2 className="mt-3 text-xl font-semibold leading-snug">{alert.title}</h2>
              <p className="mt-4 leading-7 text-[#c1c1c7]">{alert.description}</p>
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8de5bd]">How to avoid it</p>
                <p className="mt-2 leading-7 text-[#a6a6ad]">{alert.prevention}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-12" aria-labelledby="more-alerts-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e5484a]">Additional intelligence</p><h2 id="more-alerts-heading" className="mt-2 text-2xl font-bold">More alerts in this city</h2></div>
            <span className="text-sm text-[#68686f]">7 locked alerts</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {gatedAlerts.map((alert, index) => (
              <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5" key={alert.title}>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#68686f]">Alert {String(index + 6).padStart(2, "0")} / locked</p>
                <h3 className="mt-3 font-semibold">{alert.title}</h3>
                <p className="mt-3 select-none text-sm leading-6 text-[#a6a6ad]" style={{ filter: "blur(5px)", userSelect: "none" }} aria-hidden="true">{alert.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-[#e5484a]/35 bg-[#e5484a]/10 p-7 sm:p-9">
          <h2 className="text-2xl font-bold">Unlock All 12 Bangkok Scam Alerts</h2>
          <p className="mt-3 max-w-2xl text-[#c1c1c7]">Get free access to the complete safety dossier and track scams for your travel dates.</p>
          <a className="mt-6 inline-flex rounded-full bg-[#f3f3f2] px-6 py-3 font-semibold text-[#111] transition hover:bg-white" href="/signup?city=bangkok&redirect=/dashboard">Unlock All Bangkok Alerts Free</a>
        </section>

        <section className="mt-12 border-t border-white/10 pt-10" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold">Bangkok scam FAQ</h2>
          <div className="mt-5 space-y-5">
            {city.faqs.map((faq) => <div key={faq.question}><h3 className="font-semibold">{faq.question}</h3><p className="mt-2 leading-7 text-[#a6a6ad]">{faq.answer}</p></div>)}
          </div>
        </section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  );
}