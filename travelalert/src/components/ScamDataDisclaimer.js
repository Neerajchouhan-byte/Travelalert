"use client";

import { Info } from "lucide-react";

/**
 * Short inline disclaimer shown next to scam/tip content in the app.
 *
 * The wording is intentionally identical to the boxed paragraph at the top
 * of /disclaimer so users who follow the "Learn more" link land on the same
 * sentence. Keep the two in sync if either is edited.
 *
 * This is a pure presentation component — no state, no fetching.
 */
export function ScamDataDisclaimer({ className = "" }) {
  return (
    <p
      className={`flex items-start gap-1.5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 ${className}`}
    >
      <Info className="mt-0.5 size-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
      <span>
        Reports are sourced from public community discussion and
        AI-summarized. Not independently verified.{" "}
        <a
          href="/disclaimer"
          className="font-semibold underline hover:text-zinc-900 dark:hover:text-white"
        >
          Learn more
        </a>
        .
      </span>
    </p>
  );
}