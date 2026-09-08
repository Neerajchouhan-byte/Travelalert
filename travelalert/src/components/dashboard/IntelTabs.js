"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Radar, ShieldHalf, TriangleAlert } from "lucide-react";
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

const SEVERITY_LABEL = { high: "HIGH", medium: "MEDIUM", low: "LOW", tip: "TIP" };

/**
 * Scam Alerts / Insider Tips panel with segmented pill tabs and expandable
 * accordion cards. Free users see the visible slice plus blurred "locked"
 * teasers and a Pro upgrade banner wired to the upgrade modal.
 */
export function IntelTabs({
  city,
  alerts = [],
  tips = [],
  loading,
  plan = "free",
  lockedAlerts = 0,
  lockedTips = 0,
  onUpgrade,
}) {
  const [tab, setTab] = useState("alerts");
  const hasAccess = plan !== "free";
  const alertTotal = alerts.length + (hasAccess ? 0 : lockedAlerts);
  const tipTotal = tips.length + (hasAccess ? 0 : lockedTips);
  const locked = tab === "alerts" ? (hasAccess ? 0 : lockedAlerts) : (hasAccess ? 0 : lockedTips);
  const rows =
    tab === "alerts"
      ? alerts.map((a, i) => ({
          key: (a.name || "alert") + i,
          kind: "alert",
          title: a.name,
          preview: a.description || a.desc || "",
          accent: (a.severity || a.level || "medium").toLowerCase(),
          avoid: a.avoid || "",
        }))
      : tips.map((tip, i) => ({
          key: (tip.name || tip.title || "tip") + i,
          kind: "tip",
          title: tip.name || tip.title,
          preview: tip.description || tip.desc || "",
          accent: "tip",
          avoid: tip.avoid || tip.saving || "",
        }));

  const tabBtn = (isOn) =>
    `inline-flex h-10 min-h-10 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors duration-200 ${
      isOn
        ? "border border-[#f0a63d]/40 bg-[rgba(240,166,61,0.12)] text-[#f3f3f2]"
        : "border border-white/10 bg-white/[0.03] text-[#a6a6ad] hover:border-white/20 hover:text-[#f3f3f2]"
    }`;

  const lockHeadline =
    tab === "alerts"
      ? locked > 0
        ? `Unlock ${locked} more scam patterns with Pro`
        : "Unlock every scam pattern with Pro"
      : locked > 0
        ? `Unlock ${locked} more insider tips with Pro`
        : "Unlock every insider tip with Pro";

  return (
    <Panel>
      {/* Segmented pill tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 sm:px-5">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "alerts"}
          onClick={() => setTab("alerts")}
          className={tabBtn(tab === "alerts")}
        >
          <Radar className={`size-3.5 ${tab === "alerts" ? "text-[#f0a63d]" : "text-[#68686f]"}`} />
          Scam alerts
          <span className="rounded-full bg-white/[0.08] px-1.5 font-mono text-[10px] text-[#a6a6ad]">
            {alertTotal}
          </span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "tips"}
          onClick={() => setTab("tips")}
          className={tabBtn(tab === "tips")}
        >
          <Lightbulb className={`size-3.5 ${tab === "tips" ? "text-[#3ecf8e]" : "text-[#68686f]"}`} />
          Insider tips
          <span className="rounded-full bg-white/[0.08] px-1.5 font-mono text-[10px] text-[#a6a6ad]">
            {tipTotal}
          </span>
        </button>
      </div>
      {/* Accordion list */}
      <div className="space-y-2 p-3">
        {loading && (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}

        {!loading &&
          rows.map((row, index) => {
            const badge = row.kind === "tip" ? "TIP" : SEVERITY_LABEL[row.accent] || "MEDIUM";
            const accent =
              row.kind === "tip"
                ? "tip"
                : row.accent === "high"
                  ? "high"
                  : row.accent === "low"
                    ? "low"
                    : "medium";
            return (
              <ExpandableCard
                key={row.key}
                index={index}
                title={row.title}
                badge={badge}
                preview={row.preview}
                accent={accent}
              >
                <p className="text-xs leading-relaxed text-[#a6a6ad]">
                  {row.preview}
                </p>
                {row.avoid && (
                  <p className="mt-2 flex items-start gap-2 text-xs font-semibold text-[#3ecf8e]">
                    <ShieldHalf className="mt-0.5 size-3 shrink-0" />
                    {row.avoid}
                  </p>
                )}
              </ExpandableCard>
            );
          })}

        {/* Locked teasers for free users */}
        {!loading &&
          !hasAccess &&
          Array.from({ length: Math.min(Math.max(locked, 0), 2) }).map((_, i) => (
            <ExpandableCard
              key={`lock-${tab}-${i}`}
              index={rows.length + i}
              title={tab === "alerts" ? "Locked alert" : "Locked tip"}
              preview={
                tab === "alerts"
                  ? "Upgrade to Pro to unlock this scam pattern."
                  : "Upgrade to Pro to unlock this insider tip."
              }
              accent={tab === "alerts" ? "medium" : "tip"}
              locked
            />
          ))}

        {!loading && rows.length === 0 && locked === 0 && (
          <p className="px-1 py-2 text-xs text-[#a6a6ad]">
            {tab === "alerts"
              ? "No live alerts yet. Check back soon."
              : `No live tips for ${city} yet. Check back soon.`}
          </p>
        )}
      </div>

      {/* Bottom Pro banner */}
      {!loading && !hasAccess && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mx-3 mt-1 flex flex-col gap-2.5 rounded-xl border border-[#f0a63d]/25 bg-[#101013] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-[#f3f3f2]">
              <TriangleAlert className="size-3.5 shrink-0 text-[#f0a63d]" />
              {lockHeadline}
            </p>
            <p className="mt-0.5 text-xs text-[#a6a6ad]">
              Full local intelligence for every city, refreshed daily.
            </p>
          </div>
          <button
            type="button"
            onClick={onUpgrade}
            className="inline-flex h-10 min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#f0a63d] px-4 text-xs font-bold text-[#2b1a06] transition-transform active:scale-[0.97]"
          >
            Unlock alerts
          </button>
        </motion.div>
      )}
    </Panel>
  );
}