"use client";

import { useState } from "react";
import { ChevronDown, Lock } from "lucide-react";

export function ExpandableCard({
  title,
  badge,
  preview,
  children,
  locked = false,
  accent = "medium",
}) {
  const [open, setOpen] = useState(false);

  const bar = {
    high: "bg-[#e5484a]",
    medium: "bg-[#f0a63d]",
    tip: "bg-[#3ecf8e]",
    low: "bg-[#3ecf8e]",
  }[accent] || "bg-[#f0a63d]";

  const badgeCls = {
    high: "bg-[rgba(229,72,74,0.18)] text-[#e5484a]",
    medium: "bg-[rgba(240,166,61,0.18)] text-[#f0a63d]",
    tip: "bg-[rgba(62,207,142,0.18)] text-[#3ecf8e]",
    low: "bg-[rgba(62,207,142,0.18)] text-[#3ecf8e]",
  }[accent] || "bg-white/10 text-[#a6a6ad]";

  if (locked) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
        <div className={`absolute inset-y-0 left-0 w-1 ${bar} opacity-40`} />
        <div className="flex items-center gap-3 px-4 py-3 pl-5">
          <div className="min-w-0 flex-1 select-none blur-[3px]">
            <p className="truncate text-sm font-semibold">{title}</p>
            {preview && (
              <p className="mt-0.5 truncate text-xs text-[#a6a6ad]">{preview}</p>
            )}
          </div>
          <Lock className="size-3.5 shrink-0 text-[#68686f]" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20 hover:bg-white/[0.05]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-3 py-3 text-left sm:px-4"
      >
        <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${bar}`} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold leading-snug">{title}</span>
            {badge && (
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${badgeCls}`}
              >
                {badge}
              </span>
            )}
          </span>
          {!open && preview && (
            <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-[#a6a6ad]">
              {preview}
            </span>
          )}
        </span>
        <ChevronDown
          className={`mt-0.5 size-4 shrink-0 text-[#68686f] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/10 px-3 pb-3 pt-2 sm:px-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}