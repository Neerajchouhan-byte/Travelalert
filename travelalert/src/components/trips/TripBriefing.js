"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, LockKeyhole } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ScamDataDisclaimer } from "@/components/ScamDataDisclaimer";

// Combined view: each destination is a section with its alerts/tips.
// Data already sliced per plan by the trip briefing route via sliceForPlan.
export function TripBriefing({ sections = [], plan = "free", loading = false, onUpgrade }) {
  const [open, setOpen] = useState(0);
  const paid = plan !== "free";
  if (loading) return <p className="py-10 text-center text-xs text-zinc-400">Loading trip briefing…</p>;
  if (!sections.length) return <p className="py-10 text-center text-xs text-zinc-400">No destinations yet.</p>;
  return (
    <div className="space-y-4">
      {/* Inline disclaimer — visible above the first section so it appears
          alongside the combined scam/tip content, matching the dashboard
          IntelTabs placement and the /disclaimer boxed paragraph. */}
      <ScamDataDisclaimer className="px-1" />

      {sections.map((s, i) => {
        const isOpen = open === i;
        const locked = (s.lockedAlerts || 0) + (s.lockedTips || 0);
        return (
          <div key={`${s.city}-${i}`} className="rounded-[28px] border border-zinc-200/90 bg-white p-5 dark:border-white/10 dark:bg-[#16161b]">
            <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-center justify-between text-left">
              <span><span className="font-mono text-[10px] font-bold text-zinc-400">STOP {String(i + 1).padStart(2, "0")}</span>
                <span className="block text-lg font-black">{s.city}</span>
                <span className="text-[11px] text-zinc-400">{s.alerts.length} alerts · {s.tips.length} tips{s.visit_date ? ` · ${s.visit_date}` : ""}{s.safety ? ` · Safety ${s.safety}` : ""}{s.noData ? " · No cached intel yet" : ""}</span></span>
              {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  {s.noData ? (
                    <p className="pt-3 text-xs text-zinc-500">No cached intel for {s.city} yet. Search it on the dashboard first.</p>
                  ) : (
                    <div className="grid gap-4 pt-4 md:grid-cols-2">
                      <div><p className="text-[11px] font-bold uppercase text-red-600">Alerts</p>
                        <ul className="mt-2 space-y-2">{s.alerts.map((a, k) => (<li key={k} className="text-xs"><b>{a.name}</b> <span className="text-zinc-400">[{a.severity || "medium"}]</span><br /><span className="text-zinc-600">{a.description}</span></li>))}</ul></div>
                      <div><p className="text-[11px] font-bold uppercase text-amber-600">Tips</p>
                        <ul className="mt-2 space-y-2">{s.tips.map((t, k) => (<li key={k} className="text-xs"><b>{t.name}</b><br /><span className="text-zinc-600">{t.description}</span></li>))}</ul></div>
                    </div>
                  )}
                  {!paid && locked > 0 && (
                    <button type="button" onClick={onUpgrade} className="mt-4 flex w-full items-center justify-between rounded-full bg-[#fef08a] px-5 py-3 text-xs font-bold">
                      <span>Unlock {locked} more in {s.city}</span><LockKeyhole className="size-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}