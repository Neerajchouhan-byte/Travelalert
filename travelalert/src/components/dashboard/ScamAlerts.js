"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Radar, ShieldHalf } from "lucide-react";
import Link from "next/link";
import { Panel } from "./Panel";
import { ExpandableCard } from "./ExpandableCard";
import { Skeleton } from "@/components/ui/skeleton";

function SkeletonRow() {
  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <Skeleton className="h-3.5 w-2/3 bg-white/10" />
      <Skeleton className="h-3 w-full bg-white/[0.07]" />
      <Skeleton className="h-3 w-4/5 bg-white/[0.07]" />
    </div>
  );
}

export function ScamAlerts({
  alerts = [],
  loading,
  plan = "free",
  lockedCount = 0,
  city,
}) {
  const hasAccess = plan !== "free";
  const locked = hasAccess ? 0 : lockedCount;
  const upgradeHref = `/upgrade?city=${encodeURIComponent(city || "Bangkok")}&source=alerts`;

  // Ensure we always have at least 2 alerts for free users
  const displayAlerts = alerts.length > 0 ? alerts : [];

  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="size-1.5 rounded-full bg-[#e5484a]" />
          Scam alerts
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#68686f]">
          <Radar className="size-3" />
          {loading ? "SCANNING" : "LIVE"}
        </span>
      </div>
      <div className="space-y-2 p-3">
        {loading && (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}
        <AnimatePresence mode="popLayout">
          {!loading &&
            displayAlerts.map((alert, index) => {
              const level = alert.severity || alert.level || "medium";
              return (
                <ExpandableCard
                  key={(alert.name || "alert") + index}
                  index={index}
                  title={alert.name}
                  badge={alert.badge || level}
                  preview={alert.description || alert.desc}
                  accent={level}
                >
                  <p className="text-xs leading-relaxed text-[#a6a6ad]">
                    {alert.description || alert.desc}
                  </p>
                  {alert.avoid && (
                    <p className="mt-2 flex items-start gap-2 text-xs font-semibold text-[#3ecf8e]">
                      <ShieldHalf className="mt-0.5 size-3 shrink-0" />
                      {alert.avoid}
                    </p>
                  )}
                </ExpandableCard>
              );
            })}
        </AnimatePresence>
        {!loading &&
          Array.from({ length: locked }).map((_, index) => (
            <ExpandableCard
              key={`lock-${index}`}
              index={displayAlerts.length + index}
              title="Locked alert"
              preview="Upgrade to Pro to unlock this scam pattern."
              accent="medium"
              locked
            />
          ))}
        {!loading && displayAlerts.length === 0 && (
          <p className="px-1 py-2 text-xs text-[#a6a6ad]">
            No live alerts yet. Check back soon.
          </p>
        )}
        {!hasAccess && locked > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 rounded-lg border border-[rgba(91,157,238,0.38)] bg-[rgba(91,157,238,0.13)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-xs font-semibold text-[#5b9dee]">
              {locked} more alerts with full access
            </span>
            <Link
              href={upgradeHref}
              className="inline-flex h-9 min-h-9 items-center justify-center rounded-full bg-[#5b9dee] px-3 text-xs font-semibold text-[#071426]"
            >
              Unlock alerts
            </Link>
          </motion.div>
        )}
        {!hasAccess && locked === 0 && !loading && displayAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 rounded-lg border border-[rgba(91,157,238,0.38)] bg-[rgba(91,157,238,0.13)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-xs font-semibold text-[#5b9dee]">
              Unlock all alerts with Pro
            </span>
            <Link
              href={upgradeHref}
              className="inline-flex h-9 min-h-9 items-center justify-center rounded-full bg-[#5b9dee] px-3 text-xs font-semibold text-[#071426]"
            >
              Unlock alerts
            </Link>
          </motion.div>
        )}
      </div>
    </Panel>
  );
}
