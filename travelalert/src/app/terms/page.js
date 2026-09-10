import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
        ← Home
      </Link>
      <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
        Terms of Use
      </h1>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Last updated: September 5, 2026</p>
      <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        By using TravelRadar you agree to these terms. If you do not agree,
        do not use the product.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">What this product is</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        TravelRadar organizes traveler reports and model-generated briefings
        about common tourist risks. It is a research aid, not legal, safety,
        or insurance advice.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">Accounts</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        You must provide a real email. Free accounts see a limited briefing.
        Trip Passes provide full access for 30 days, and Annual plans provide
        full access while active.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">Payments</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Dodo Payments processes checkout. The Annual plan is billed once each
        year and can be cancelled before its next renewal. Trip Passes are
        one-time purchases and do not renew.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">Accuracy</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Alerts can be incomplete, outdated, or wrong. You are responsible for
        your own decisions while traveling.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">Acceptable use</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Do not scrape, resell, or abuse the API. We may suspend accounts that
        do.
      </p>
    </main>
  );
}