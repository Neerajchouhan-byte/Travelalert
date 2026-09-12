"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, LockKeyhole, Route } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Expandable Trip Mode entry card. Renders directly under DestinationHeader
// in every dashboard layout branch, so on laptop (xl) it sits in the same
// first column next to/below the header, and on tablet/mobile it stacks
// under the header. Paid users get links to /dashboard/trips; Explorer
// users get the locked upsell that opens the existing UpgradeModal.
export function TripModeCard({ plan = "free", onUpgrade }) {
  const [open, setOpen] = useState(false);
  const paid = plan !== "free";
  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#e5283b] dark:bg-red-950/50 dark:text-[#f87171]">
            <Route className="size-4.5" />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-zinc-900 dark:text-white">Trip Mode</span>
              {!paid && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-amber-800 dark:bg-amber-950/70 dark:text-amber-400">Pro</span>
              )}
            </span>
            <span className="mt-0.5 block truncate text-xs text-zinc-500 dark:text-zinc-400">One briefing across 3–6 cities</span>
          </span>
        </span>
        {open ? <ChevronDown className="size-4 shrink-0 text-zinc-400" /> : <ChevronRight className="size-4 shrink-0 text-zinc-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <ul className="space-y-1.5 pt-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              <li>Build a trip of 3–6 destinations with optional dates.</li>
              <li>Combined alerts + tips per stop, exportable as PDF or email.</li>
              {!paid && <li className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300"><LockKeyhole className="size-3.5" /> Trip Pass ($7/30 days) or Annual ($29/year).</li>}
            </ul>
            {paid ? (
              <div className="flex flex-wrap gap-2 pt-4">
                <Link href="/dashboard/trips" className="inline-flex h-10 items-center rounded-full bg-black px-5 text-xs font-bold text-white dark:border dark:border-white/20">Open Trip Mode</Link>
                <Link href="/dashboard/trips" className="inline-flex h-10 items-center rounded-full border border-zinc-200/90 px-5 text-xs font-bold dark:border-white/10">My trips</Link>
              </div>
            ) : (
              <button type="button" onClick={onUpgrade} className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-black text-xs font-bold text-white dark:border dark:border-white/20">Upgrade to unlock Trip Mode</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
