"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, ShieldHalf } from "lucide-react";
import Link from "next/link";
import { Panel } from "./Panel";
import { ExpandableCard } from "./ExpandableCard";
import { Skeleton } from "@/components/ui/skeleton";

function TipSkeleton() {
  return <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3"><Skeleton className="h-3.5 w-1/2 bg-white/10" /><Skeleton className="h-3 w-full bg-white/[0.07]" /></div>;
}

export function InsiderTips({ tips = [], loading, city, plan = "free", lockedCount = 0 }) {
  const hasAccess = plan !== "free";
  const rows = tips.map((tip) => ({ title: tip.name || tip.title, desc: tip.description || tip.desc, saving: tip.avoid || tip.saving }));

  // For free users the API only sends the visible slice, so the number of
  // locked tips arrives separately as lockedCount — render them as blurred
  // placeholders plus the upgrade prompt (mirrors ScamAlerts).
  const locked = hasAccess ? 0 : Math.max(0, lockedCount || 0);

  return (
    <Panel>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5"><div className="flex items-center gap-2 text-sm font-bold"><Lightbulb className="size-4 text-[#3ecf8e]" />Insider tips</div><span className="font-mono text-[11px] text-[#68686f]">{loading ? "LOADING" : `${(city || "").toUpperCase()} · ${rows.length + locked} TIPS`}</span></div>
      <div className="space-y-2 p-3">
        {loading && <><TipSkeleton /><TipSkeleton /><TipSkeleton /></>}
        <AnimatePresence mode="popLayout">{!loading && rows.map((tip, index) => <ExpandableCard key={tip.title} index={index} title={tip.title} preview={tip.desc} badge="tip" accent="tip"><p className="text-xs leading-relaxed text-[#a6a6ad]">{tip.desc}</p>{tip.saving && <p className="mt-2 flex items-start gap-2 text-xs font-semibold text-[#3ecf8e]"><ShieldHalf className="mt-0.5 size-3 shrink-0" />{tip.saving}</p>}</ExpandableCard>)}</AnimatePresence>
        {!loading && Array.from({ length: locked }).map((_, index) => <ExpandableCard key={`lock-${index}`} index={rows.length + index} title="Locked tip" preview="Upgrade to Pro to unlock this insider tip." accent="tip" locked />)}
        {!loading && rows.length === 0 && <p className="px-1 py-2 text-xs text-[#a6a6ad]">No live tips for {city} yet. Check back soon.</p>}
        {!hasAccess && locked > 0 && !loading && <div className="flex flex-col gap-2 rounded-lg border border-[rgba(91,157,238,0.38)] bg-[rgba(91,157,238,0.13)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs font-semibold text-[#5b9dee]">{locked} more tips with full access</span><Link href="/#pricing" className="inline-flex h-7 items-center justify-center rounded-full bg-[#5b9dee] px-3 text-xs font-semibold text-[#071426]">View access options</Link></div>}
        {!hasAccess && locked === 0 && !loading && rows.length > 0 && <div className="flex flex-col gap-2 rounded-lg border border-[rgba(91,157,238,0.38)] bg-[rgba(91,157,238,0.13)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs font-semibold text-[#5b9dee]">Unlock all tips with Pro</span><Link href="/#pricing" className="inline-flex h-7 items-center justify-center rounded-full bg-[#5b9dee] px-3 text-xs font-semibold text-[#071426]">View access options</Link></div>}
      </div>
    </Panel>
  );
}