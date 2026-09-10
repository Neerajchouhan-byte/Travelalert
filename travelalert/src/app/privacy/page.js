import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
        ← Home
      </Link>
      <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
        Privacy Policy
      </h1>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Last updated: September 5, 2026</p>
      <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        TravelRadar ("we") provides destination safety briefings. This page
        explains what we collect and why.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">What we collect</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>Email and password when you create an account (handled by Supabase Auth).</li>
        <li>The city you search, so we can show the right briefing.</li>
        <li>Access status for a Trip Pass or Annual plan after you pay.</li>
        <li>Payment details are collected by Dodo Payments, not stored on our servers.</li>
      </ul>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">How we use it</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>To log you in and remember your plan.</li>
        <li>To generate and cache city briefings.</li>
        <li>To process upgrades.</li>
      </ul>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">What we do not do</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>We do not sell your email list.</li>
        <li>We do not store card numbers.</li>
      </ul>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">Contact</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Questions: use the email on your TravelRadar account.
      </p>
    </main>
  );
}