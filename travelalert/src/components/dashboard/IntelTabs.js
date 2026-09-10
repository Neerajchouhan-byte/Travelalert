"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, LockKeyhole } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
  const [expandedIndex, setExpandedIndex] = useState(null);

  const hasAccess = plan !== "free";

  const defaultAlerts = [
    {
      name: "ATM Skimming Notice · Canggu",
      severity: "high",
      description:
        "Card skimmers detected at standalone tourist ATMs near Batu Bolong.",
      avoid: "Use ATMs inside official bank branches.",
      time: "1h ago",
    },
    {
      name: "Fake Taxi Meters · Airport Rd",
      severity: "medium",
      description:
        "Unlicensed drivers quoting inflated fixed fares instead of running the meter.",
      avoid: "Book Grab or official Bluebird taxis via their app.",
      time: "3h ago",
    },
  ];

  const defaultTips = [
    {
      name: "Best Money Exchange · Central Kuta",
      description: "BMC or Central Kuta Money Exchange offer zero commission.",
      avoid: "Never use small alley exchange booths.",
      time: "2h ago",
    },
    {
      name: "Airport Grab Pickup Point · Domestic Terminal",
      description: "Follow the green Grab Lounge signs on Level 2 for set rates.",
      avoid: "Decline arrivals curb offers.",
      time: "4h ago",
    },
  ];

  const alertList = alerts.length > 0 ? alerts : defaultAlerts;
  const tipList = tips.length > 0 ? tips : defaultTips;

  const activeItems = tab === "alerts" ? alertList : tipList;
  const lockedCount =
    tab === "alerts"
      ? hasAccess
        ? 0
        : lockedAlerts || 10
      : hasAccess
        ? 0
        : lockedTips || 10;

  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#16161b]">
      {/* Header */}
      <div>
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
          AI-organized Reddit intelligence
        </p>
      </div>

      {/* Filter pills */}
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

      {/* Items List */}
      <div className="mt-5 divide-y divide-zinc-100 dark:divide-white/5">
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

        {/* Blurred teaser locked rows for free tier */}
        {!hasAccess && (
          <>
            <div className="flex items-center justify-between py-3.5">
              <div className="select-none blur-[4px] text-zinc-400 dark:text-zinc-600">
                <p className="text-sm font-bold">Tour Guide Deposit Scam · Seminyak</p>
                <p className="text-xs">4h ago</p>
              </div>
              <LockKeyhole className="size-4 text-zinc-400 dark:text-zinc-500" />
            </div>

            <div className="flex items-center justify-between py-3.5">
              <div className="select-none blur-[4px] text-zinc-400 dark:text-zinc-600">
                <p className="text-sm font-bold">Counterfeit Fast Boat Tickets · Sanur</p>
                <p className="text-xs">5h ago</p>
              </div>
              <LockKeyhole className="size-4 text-zinc-400 dark:text-zinc-500" />
            </div>
          </>
        )}
      </div>

      {/* Pro unlock button */}
      {!hasAccess && (
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