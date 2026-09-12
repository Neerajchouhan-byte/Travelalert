"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Banknote, CloudSun, CookingPot, Route, ShieldAlert } from "lucide-react";
import { useState } from "react";

const coverage = [
  {
    label: "Scam alerts",
    tag: "WATCH",
    icon: ShieldAlert,
    title: "See the expensive mistake before it happens.",
    body: "Fresh reports are distilled into clear warnings for taxis, tours, ATMs, tickets, and the small traps that do not make it into a guidebook.",
    metric: "50+",
    metricLabel: "destinations covered",
    note: "Reports are refreshed daily",
  },
  {
    label: "Weather",
    tag: "ARRIVE",
    icon: CloudSun,
    title: "Know what the city feels like outside.",
    body: "Current temperature, UV, humidity, and a useful note about what to wear when you step out of the airport.",
    metric: "LIVE",
    metricLabel: "CONDITIONS",
    note: "Updated for your arrival day",
  },
  {
    label: "Food",
    tag: "EAT WELL",
    icon: CookingPot,
    title: "Find the good table, skip the tourist markup.",
    body: "Local picks, honest ordering advice, and the places travelers mention for the right reasons.",
    metric: "847",
    metricLabel: "LOCAL PICKS",
    note: "Sorted by traveler signal",
  },
  {
    label: "Transport",
    tag: "MOVE",
    icon: Route,
    title: "Move through the city with the price in view.",
    body: "Fair fares, trusted apps, airport routes, and the transport patterns visitors report most often.",
    metric: "28%",
    metricLabel: "SAVED ON AVG",
    note: "Compared with curbside rates",
  },
  {
    label: "Currency",
    tag: "PAY",
    icon: Banknote,
    title: "Keep silent fees from becoming the souvenir.",
    body: "Live local rates and practical ATM advice for the exact moment a card terminal asks you to choose a currency.",
    metric: "0%",
    metricLabel: "GUESSWORK",
    note: "Local rate checked live",
  },
];

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = coverage[activeIndex];

  return (
    <section id="features" className="py-20 sm:py-28 border-b border-zinc-200/80 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header with reveal animation */}
        <div className="reveal">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#e5283b]">
            — WHAT WE COVER
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            One briefing. <span className="text-[#e5283b]">Fewer unknowns.</span>
          </h2>
          <p className="mt-2 max-w-xl text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
            Choose the decision you&apos;re about to make. TravelRadar gives you
            useful context without making you read a guidebook.
          </p>
        </div>

        {/* 2-Column Workspace */}
        <div className="reveal mt-10 grid grid-cols-1 gap-4 lg:grid-cols-12">
          
          {/* Left Index */}
          <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 lg:col-span-5 flex flex-col justify-between shadow-xs dark:border-white/10 dark:bg-[#141418]">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                BRIEFING MODULES
              </p>
              <div className="mt-4 space-y-1">
                {coverage.map((item, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold transition ${
                        isActive
                          ? "bg-red-50 text-[#e5283b] border border-red-200 dark:bg-[#201518] dark:text-[#f87171] dark:border-red-900/40"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                      }`}
                    >
                      <span>
                        0{index + 1} {item.label}
                      </span>
                      <span className="font-mono text-[10px] opacity-70">
                        {isActive ? "VIEWING" : ">"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 pt-4 border-t border-zinc-100 text-[11px] font-mono text-zinc-500 dark:border-white/5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>Briefing signal online</span>
            </div>
          </div>

          {/* Right Detail Pane with restored AnimatePresence animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.label}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.22 }}
              className="relative overflow-hidden rounded-[28px] border border-zinc-200/90 bg-white p-6 lg:col-span-7 flex flex-col justify-between shadow-xs sm:p-8 dark:border-white/10 dark:bg-[#16161b]"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-red-600/10 blur-3xl dark:bg-red-900/15" />

              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#e5283b]">
                  ● INITIAL MODULE 0{activeIndex + 1}
                </span>
                <h3 className="mt-4 text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                  {active.title}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-400">
                  {active.body}
                </p>
              </div>

              <div className="mt-10 flex items-end justify-between border-t border-zinc-100 pt-5 dark:border-white/5">
                <div>
                  <p className="font-mono text-2xl font-black text-zinc-900 sm:text-3xl dark:text-white">
                    {active.metric}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {active.metricLabel}
                  </p>
                </div>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">{active.note}</span>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}