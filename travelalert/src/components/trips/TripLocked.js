"use client";
import { LockKeyhole } from "lucide-react";
import Link from "next/link";

// Locked upsell for Explorer users. Trip Mode (>1 destination, export)
// is Trip Pass / Annual only. Reuses UpgradeModal pattern via ?upgrade=true.
export function TripLocked({ city = "" }) {
  const href = city ? `/dashboard?city=${encodeURIComponent(city)}&upgrade=true` : "/dashboard?upgrade=true";
  return (
    <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900/40 dark:bg-amber-950/30">
      <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50"><LockKeyhole className="size-5 text-amber-700 dark:text-amber-300" /></span>
      <h3 className="mt-3 text-lg font-black">Trip Mode is a Pro feature</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-600 dark:text-zinc-400">Build a 3–6 city briefing and export it as PDF or email with Trip Pass ($7/30 days) or Annual ($29/year).</p>
      <Link href={href} className="mt-4 inline-flex h-11 items-center rounded-full bg-black px-6 text-xs font-bold text-white">Upgrade to unlock Trip Mode</Link>
    </div>
  );
}
