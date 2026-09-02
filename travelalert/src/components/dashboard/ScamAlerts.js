import { ArrowRight, Lock, ShieldHalf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "./Panel";
import { alerts } from "@/lib/dashboard-data";

const styles = {
  high: "bg-[rgba(229,72,74,0.14)] border-l-[#e5484a]",
  medium: "bg-[rgba(240,166,61,0.13)] border-l-[#f0a63d]",
  low: "bg-[rgba(62,207,142,0.13)] border-l-[#3ecf8e]",
};

const badges = {
  high: "bg-[rgba(229,72,74,0.18)] text-[#e5484a]",
  medium: "bg-[rgba(240,166,61,0.18)] text-[#f0a63d]",
  low: "bg-[rgba(62,207,142,0.18)] text-[#3ecf8e]",
};

export function ScamAlerts() {
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="size-1.5 rounded-full bg-[#e5484a]" />
          Active scam alerts
        </div>
        <span className="font-mono text-[11px] text-[#68686f]">12 ALERTS THIS WEEK</span>
      </div>

      <div className="space-y-2 p-3">
        {alerts.map((a) => (
          <article key={a.name} className={`rounded-lg border-l-[3px] p-3 ${styles[a.level]}`}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold">{a.name}</h3>
              <Badge className={`${badges[a.level]} font-mono text-[10px] uppercase`}>{a.badge}</Badge>
            </div>
            <p className="mb-2 text-xs leading-relaxed text-[#a6a6ad]">{a.desc}</p>
            <p className="flex items-start gap-2 text-xs font-semibold">
              <ShieldHalf className="mt-0.5 size-3 shrink-0 text-[#3ecf8e]" />
              {a.avoid}
            </p>
            <span className="mt-2 inline-flex rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-[#68686f]">
              {a.source}
            </span>
          </article>
        ))}

        <LockedRow />
        <LockedRow />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[rgba(91,157,238,0.38)] bg-[rgba(91,157,238,0.13)] px-3 py-2.5">
          <span className="text-xs font-semibold text-[#5b9dee]">Unlock 9 more alerts for Bangkok</span>
          <Button size="sm" className="h-7 rounded-full bg-[#5b9dee] text-[#071426] hover:bg-[#5b9dee]/90">
            Upgrade Pro <ArrowRight className="size-3" />
          </Button>
        </div>
      </div>
    </Panel>
  );
}

function LockedRow() {
  return (
    <div className="flex items-center justify-between rounded-lg border-l-[3px] border-white/16 bg-[#101013] px-3 py-3 opacity-45">
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-1.5 w-[70%] rounded bg-white/16" />
        <div className="h-1.5 w-1/2 rounded bg-white/16" />
      </div>
      <Lock className="ml-4 size-3.5 text-[#68686f]" />
    </div>
  );
}
