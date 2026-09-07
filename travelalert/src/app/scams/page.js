import Link from "next/link";

export const metadata = {
  title: "Tourist Scam Guides by City | TravelRadar",
  description: "Verified tourist scam alerts and transit traps for popular destinations.",
};

export default function ScamsIndexPage() {
  return (
    <main className="min-h-svh bg-[#07070a] px-5 py-16 text-[#f3f3f2] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5484a]">TravelRadar / Scam intelligence</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Tourist scam guides by city.</h1>
        <p className="mt-5 max-w-2xl text-lg text-[#a6a6ad]">Verified warnings and practical prevention advice before you land.</p>
        <Link className="mt-10 inline-flex rounded-full bg-[#f3f3f2] px-6 py-3 font-semibold text-[#111]" href="/scams/bangkok">Read the Bangkok guide</Link>
      </div>
    </main>
  );
}