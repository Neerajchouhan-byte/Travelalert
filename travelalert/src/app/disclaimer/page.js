import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
        ← Home
      </Link>
      <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
        Disclaimer
      </h1>
      <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        TravelRadar summaries come from public traveler posts and an AI model.
        They are not a guarantee you will avoid crime, scams, or loss.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Always use official transport apps, bank ATMs, and your own judgment.
        We are not liable for money lost, missed trips, or injury.
      </p>
    </main>
  );
}