"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Lock, ShieldHalf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel } from "./Panel";
import { supabase } from "@/lib/supabase";
import { checkoutUrl } from "@/lib/checkout";

const styles = {
  high: "bg-[rgba(229,72,74,0.14)] border-l-[#e5484a]",
  medium: "bg-[rgba(240,166,61,0.13)] border-l-[#f0a63d]",
  tip: "bg-[rgba(62,207,142,0.13)] border-l-[#3ecf8e]",
  low: "bg-[rgba(62,207,142,0.13)] border-l-[#3ecf8e]",
};

const badges = {
  high: "bg-[rgba(229,72,74,0.18)] text-[#e5484a]",
  medium: "bg-[rgba(240,166,61,0.18)] text-[#f0a63d]",
  tip: "bg-[rgba(62,207,142,0.18)] text-[#3ecf8e]",
  low: "bg-[rgba(62,207,142,0.18)] text-[#3ecf8e]",
};

function LockedRow() {
  return (
    <div className="relative rounded-lg border border-white/10 px-3 py-3 opacity-50">
      <p className="blur-[3px] select-none text-xs">Hidden alert for Pro users</p>
      <Lock className="absolute right-3 top-3 size-3.5 text-[#68686f]" />
    </div>
  );
}

export function ScamAlerts({ alerts = [], loading, plan = "free" }) {
  const isPro = plan === "pro" || plan === "lifetime";
  const visible = isPro ? alerts : alerts.slice(0, 2);
  const lockedCount = isPro ? 0 : Math.max(0, alerts.length - 2);

  const [upgradeHref, setUpgradeHref] = useState(
    process.env.NEXT_PUBLIC_CHECKOUT_PRO || "/login"
  );

  useEffect(() => {
    let on = true;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!on || !user) return;
      setUpgradeHref(checkoutUrl("pro", user.id, user.email));
    })();
    return () => {
      on = false;
    };
  }, []);

  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="size-1.5 rounded-full bg-[#e5484a]" />
          Active scam alerts
        </div>
        <span className="font-mono text-[11px] text-[#68686f]">
          {alerts.length} ALERTS
        </span>
      </div>

      <div className="space-y-2 p-3">
        {loading && (
          <p className="px-1 py-2 text-xs text-[#a6a6ad]">Loading alerts…</p>
        )}

        {!loading && visible.length === 0 && (
          <p className="px-1 py-2 text-xs text-[#a6a6ad]">No live alerts yet.</p>
        )}

        {visible.map((a, i) => {
          const level = a.severity || a.level || "medium";
          return (
            <article
              key={a.name + i}
              className={`rounded-lg border-l-[3px] p-3 ${styles[level] || styles.medium}`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold">{a.name}</h3>
                <Badge
                  className={`${badges[level] || badges.medium} font-mono text-[10px] uppercase`}
                >
                  {a.badge || level}
                </Badge>
              </div>
              <p className="mb-2 text-xs leading-relaxed text-[#a6a6ad]">
                {a.description || a.desc}
              </p>
              <p className="flex items-start gap-2 text-xs font-semibold">
                <ShieldHalf className="mt-0.5 size-3 shrink-0 text-[#3ecf8e]" />
                {a.avoid}
              </p>
            </article>
          );
        })}

        {!isPro && lockedCount > 0 && (
          <>
            <LockedRow />
            <LockedRow />
          </>
        )}

        {!isPro && lockedCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[rgba(91,157,238,0.38)] bg-[rgba(91,157,238,0.13)] px-3 py-2.5">
            <span className="text-xs font-semibold text-[#5b9dee]">
              Unlock full alerts
            </span>
            <a
              href={upgradeHref}
              className="inline-flex h-7 items-center gap-1 rounded-full bg-[#5b9dee] px-3 text-xs font-semibold text-[#071426]"
            >
              Upgrade Pro <ArrowRight className="size-3" />
            </a>
          </div>
        )}
      </div>
    </Panel>
  );
}