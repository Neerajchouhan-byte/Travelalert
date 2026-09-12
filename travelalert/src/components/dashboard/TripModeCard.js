"use client";

import Link from "next/link";
import { LockKeyhole, Route } from "lucide-react";

// Always-visible compact card. The three numbered steps are presentational
// only — they describe the existing flow (build the trip → open its briefing
// → travel). They do not add, remove, or alter any behavior.
const STEPS = [
  { n: "1", label: "Plan", desc: "Choose your route" },
  { n: "2", label: "Check", desc: "Review live intel" },
  { n: "3", label: "Go", desc: "Start with confidence" },
];

export function TripModeCard({ plan = "free", onUpgrade }) {
  const paid = plan !== "free";

  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
      {/* Header: icon + title + Pro badge (free users only) + subtitle */}
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#e5283b] dark:bg-red-950/50 dark:text-[#f87171]">
          <Route className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black tracking-tight text-zinc-900 dark:text-white">
              Trip Mode
            </h3>
            {!paid && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-amber-800 dark:bg-amber-950/70 dark:text-amber-400">
                Pro
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            One trip across 3–6 cities
          </p>
        </div>
      </div>

      {/* Three-step summary. Matches the reference: numbered badge, label,
          short description. Rendered as plain presentational markup. */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-zinc-200/90 bg-white p-3 dark:border-white/10 dark:bg-[#1c1c22]"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-red-50 font-mono text-[10px] font-black text-[#e5283b] dark:bg-red-950/50 dark:text-[#f87171]">
              {s.n}
            </span>
            <p className="mt-2 text-xs font-black text-zinc-900 dark:text-white">
              {s.label}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Single action button, matching the reference. Paid → link to
          /dashboard/trips (same destination as before). Free → opens the
          existing upgrade modal via onUpgrade (same handler as before). */}
      {paid ? (
        <Link
          href="/dashboard/trips"
          className="mt-4 flex h-10 w-full items-center justify-center rounded-full bg-[#e5283b] text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Open trip mode
        </Link>
      ) : (
        <button
          type="button"
          onClick={onUpgrade}
          className="mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[#e5283b] text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <LockKeyhole className="size-3.5" />
          <span>Unlock Trip Mode</span>
        </button>
      )}
    </div>
  );
}