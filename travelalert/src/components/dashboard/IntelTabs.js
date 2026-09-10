"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, LockKeyhole, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function IntelTabs({
  city,
  alerts = [],
  tips = [],
  loading = false,
  plan = "free",
  lockedAlerts = 0,
  lockedTips = 0,
  noData = false,
  onUpgrade,
  onRefresh,
  refreshing = false,
  refreshLocked = false,
}) {
  const [tab, setTab] = useState("alerts");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const hasAccess = plan !== "free";
  const hasAnyData = alerts.length > 0 || tips.length > 0;
  // Loading wins over any stale data — even if the parent forgot to clear it.
  const showLoading = loading;
  const showEmpty = !loading && !hasAnyData && noData;

  const alertList = alerts;
  const tipList = tips;
  const activeItems = tab === "alerts" ? alertList : tipList;
  const lockedCount = tab === "alerts" ? lockedAlerts : lockedTips;

  function handleRefreshClick() {
    if (refreshLocked) {
      onUpgrade?.();
      return;
    }
    onRefresh?.();
  }

  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#16161b]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
              Scam &amp; Insider Intel
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="live-dot" />
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Live scan
              </span>
            </div>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            AI-organized traveler report intelligence
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefreshClick}
          disabled={refreshing}
          aria-label={refreshLocked ? "Upgrade to refresh intel" : "Refresh intel"}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-white/10 dark:bg-[#16161b] dark:text-zinc-300 dark:hover:bg-white/5"
        >
          <RefreshCw
            className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>{refreshing ? "Refreshing" : "Refresh"}</span>
        </button>
      </div>

      <div className="mt-5 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            setTab("alerts");
            setExpandedIndex(null);
          }}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
            tab === "alerts"
              ? "bg-[#fee2e2] text-[#dc2626] dark:bg-[#3a1417] dark:text-[#f87171]"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 dark:bg-white/5 dark:text-zinc-400"
          }`}
        >
          Scam Alerts: {alertList.length}
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("tips");
            setExpandedIndex(null);
          }}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
            tab === "tips"
              ? "bg-[#fef3c7] text-[#d97706] dark:bg-[#332210] dark:text-[#fbbf24]"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 dark:bg-white/5 dark:text-zinc-400"
          }`}
        >
          Insider Tips: {tipList.length}
        </button>
      </div>

      <div className="mt-5 max-h-[520px] overflow-y-auto pr-1">
        {showLoading && (
          <div className="py-12 text-center">
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
              Loading intel for {city}…
            </p>
          </div>
        )}

        {showEmpty && (
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              No cached intel for {city} yet.
            </p>
            <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
              Click Refresh above to fetch live traveler reports for this
              destination.
              {plan === "free" &&
                " On the free plan, this uses one of your 3 searches this month."}
            </p>
          </div>
        )}

        {!showLoading && !showEmpty && (
          <div className="divide-y divide-zinc-100 dark:divide-white/5">
            {activeItems.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              const isHigh =
                (item.severity || "").toLowerCase() === "high" || idx === 0;

              return (
                <div key={item.name + idx} className="py-3.5 first:pt-0">
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="flex w-full items-start justify-between text-left"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          {item.name}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                            isHigh
                              ? "bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400"
                          }`}
                        >
                          {isHigh ? "High" : "Medium"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                        {item.time || `${idx + 1}h ago`}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="size-4 shrink-0 text-zinc-400" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 text-zinc-400" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300"
                      >
                        <p>{item.description || item.desc}</p>
                        {item.avoid && (
                          <p className="mt-1.5 font-semibold text-[#10b981]">
                            ✓ {item.avoid}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {!hasAccess && lockedCount > 0 && (
              <>
                <div className="flex items-center justify-between py-3.5">
                  <div className="select-none blur-[4px] text-zinc-400 dark:text-zinc-600">
                    <p className="text-sm font-bold">Locked pattern · Pro only</p>
                    <p className="text-xs">4h ago</p>
                  </div>
                  <LockKeyhole className="size-4 text-zinc-400 dark:text-zinc-500" />
                </div>

                <div className="flex items-center justify-between py-3.5">
                  <div className="select-none blur-[4px] text-zinc-400 dark:text-zinc-600">
                    <p className="text-sm font-bold">Locked pattern · Pro only</p>
                    <p className="text-xs">5h ago</p>
                  </div>
                  <LockKeyhole className="size-4 text-zinc-400 dark:text-zinc-500" />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {!hasAccess && lockedCount > 0 && !showEmpty && !showLoading && (
        <button
          type="button"
          onClick={onUpgrade}
          className="mt-5 flex w-full items-center justify-between rounded-2xl bg-[#fef08a] px-6 py-3.5 text-xs font-bold text-zinc-950 transition-colors hover:bg-[#fde047] sm:rounded-full dark:bg-[#fde047] dark:text-zinc-950 dark:hover:bg-[#facc15]"
        >
          <span>Unlock {lockedCount} more scam patterns with Pro</span>
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}