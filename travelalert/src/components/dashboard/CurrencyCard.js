"use client";

import { CircleCheck, TriangleAlert } from "lucide-react";
import { Panel } from "./Panel";

export function CurrencyCard({ brief }) {
  const code = brief?.code || "—";
  const usd =
    brief?.usd != null
      ? Number(brief.usd).toLocaleString(undefined, { maximumFractionDigits: 2 })
      : "—";
  const inr = brief?.inr != null ? Number(brief.inr).toFixed(2) : "—";
  const eur = brief?.eur != null ? Number(brief.eur).toFixed(2) : "—";

  return (
    <Panel>
      <div className="p-5">
        <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#68686f]">
          Live exchange rate{brief?.city ? ` · ${brief.city}` : ""}
        </div>
        <div className="font-mono text-[1.25rem] font-bold">
          {brief ? `1 USD = ${usd} ${code}` : "Loading rate…"}
        </div>
        <div className="mt-1 mb-3 text-xs text-[#a6a6ad]">
          1 INR = {inr} {code} · 1 EUR = {eur} {code}
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-[rgba(240,166,61,0.38)] bg-[rgba(240,166,61,0.13)] p-2.5">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-[#f0a63d]" />
          <p className="text-[11px] leading-relaxed text-[#a6a6ad]">
            {brief?.money_avoid || "Fetching money advice…"}
          </p>
        </div>
        <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-[#3ecf8e]">
          <CircleCheck className="size-3.5" />
          {brief?.money_best || "…"}
        </p>
      </div>
    </Panel>
  );
}