import Link from "next/link";

export const metadata = {
  title: "Disclaimer | TravelRadar",
  description:
    "TravelRadar briefings are sourced from public community discussion and AI-summarized. They are not independently verified.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        ← Home
      </Link>

      <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
        Disclaimer
      </h1>

      {/* The short version — same phrasing used inline next to scam content
          in the app. Kept verbatim so users who click through from an inline
          disclaimer find the identical sentence. */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900/40 dark:bg-amber-950/30">
        <p className="text-sm font-semibold leading-relaxed text-amber-900 dark:text-amber-200">
          Scam reports are sourced from public community discussion and
          AI-summarized. Not independently verified. Use your own judgment.
        </p>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Every alert, tip, and briefing shown in TravelRadar is generated
        automatically from publicly available discussion about travel
        destinations. TravelRadar does not investigate, verify, or endorse
        any of the claims that appear in a briefing.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        What this means in practice
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>
          A briefing describes what some people have written online, not
          what is true about a place, business, or person.
        </li>
        <li>
          A scam pattern that appears in a briefing may not be currently
          active, and one that does not appear may still be active.
        </li>
        <li>
          Prices, transport options, entry rules, and safety conditions can
          change quickly. Confirm critical information through official
          channels.
        </li>
        <li>
          TravelRadar is a research aid. It is not a substitute for your own
          judgment, local advice, official travel advisories, or emergency
          services.
        </li>
      </ul>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        No liability
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        TravelRadar is not liable for any loss, harm, injury, theft, fraud,
        or financial damage that occurs during travel, regardless of whether
        the Service warned of, missed, or mischaracterized a risk. See the{" "}
        <Link
          href="/terms"
          className="font-semibold text-zinc-900 underline hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
        >
          Terms of Service
        </Link>{" "}
        for the full limitation-of-liability terms.
      </p>

      <p className="mt-10 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-500">
        See also:{" "}
        <Link href="/terms" className="underline hover:text-zinc-900 dark:hover:text-white">
          Terms of Service
        </Link>{" "}
        ·{" "}
        <Link href="/privacy" className="underline hover:text-zinc-900 dark:hover:text-white">
          Privacy Policy
        </Link>
      </p>
    </main>
  );
}