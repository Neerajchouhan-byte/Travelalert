"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const scams = [
  {
    destination: "BANGKOK, THAILAND",
    badge: "HIGH RISK",
    loss: "$200 AVG LOSS",
    name: "Tuk-Tuk Free Temple Tour",
    description:
      "A friendly local near the Grand Palace offers a free tuk-tuk tour, then drives you to gem shops with heavy pressure to buy.",
    avoidanceTip: "Refuse free tour offers. Use the Grab app instead.",
    sourceInfo: "REPORTED 4X THIS WEEK · 847 UPVOTES",
  },
  {
    destination: "BALI, INDONESIA",
    badge: "HIGH RISK",
    loss: "$150 AVG LOSS",
    name: "Motorbike Damage Claim",
    description:
      "Rental returned, owner claims new damage and demands cash, refusing insurance.",
    avoidanceTip: "Photo every scratch before riding.",
    sourceInfo: "REPORTED 6X THIS WEEK",
  },
  {
    destination: "PRAGUE, CZECHIA",
    badge: "MEDIUM",
    loss: "$400 AVG LOSS",
    name: "ATM Skimming Device",
    description:
      "Skimmers found on standalone ATMs near Old Town Square. Cards cloned within hours.",
    avoidanceTip: "Use bank-branch ATMs. Cover the keypad.",
    sourceInfo: "CONFIRMED THIS WEEK",
  },
  {
    destination: "HANOI, VIETNAM",
    badge: "MEDIUM",
    loss: "$25 AVG LOSS",
    name: "Taxi No-Meter Scam",
    description:
      "Driver claims a broken meter, then charges 3 to 5x fare, common late night at Noi Bai.",
    avoidanceTip: "Use Grab. Agree the price first.",
    sourceInfo: "REPORTED 9X THIS WEEK",
  },
  {
    destination: "BANGKOK, THAILAND",
    badge: "TIP",
    loss: "$45 SAVING",
    name: "Best Transport From the Airport",
    description:
      "Download Grab before landing. Fixed price around 280 THB, versus street taxis charging 800 to 1200 THB.",
    avoidanceTip: "Book Grab before leaving the arrivals hall.",
    sourceInfo: "3.4K UPVOTES · VERIFIED TIP",
  },
];

export default function Scamcards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = scams[activeIndex];

  return (
    <section id="scams" className="py-20 sm:py-28 border-b border-zinc-200/80 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="reveal">
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Active right now. <span className="text-[#e5283b]">Updated daily.</span>
          </h2>
          <p className="mt-2 text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
            Every alert below is sourced from real traveler reports this week, not
            a 2019 blog post.
          </p>
        </div>

        {/* 2-Column Board */}
        <div className="reveal mt-10 grid grid-cols-1 gap-4 lg:grid-cols-12">
          
          {/* Left Signal List */}
          <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-xs lg:col-span-5 dark:border-white/10 dark:bg-[#141418]">
            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 uppercase tracking-wider pb-3 border-b border-zinc-100 dark:border-white/5 dark:text-zinc-500">
              <span>RELATED SIGNALS</span>
              <span className="text-[#e5283b] font-bold">5 LIVE</span>
            </div>

            <div className="mt-3 space-y-1">
              {scams.map((scam, index) => {
                const isCurrent = index === activeIndex;
                return (
                  <button
                    key={scam.name}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left transition ${
                      isCurrent
                        ? "bg-red-50 text-[#e5283b] border border-red-200 dark:bg-[#201518] dark:text-[#f87171] dark:border-red-900/40"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">{scam.name}</p>
                      <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                        {scam.destination}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Detail Card with restored AnimatePresence animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-xs lg:col-span-7 flex flex-col justify-between sm:p-8 dark:border-white/10 dark:bg-[#16161b]"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[10px] uppercase text-zinc-400 dark:text-zinc-500">
                  <span className="text-[#e5283b] font-bold">
                    ● {active.badge} · 0{activeIndex + 1} / 0{scams.length}
                  </span>
                </div>

                <p className="mt-4 font-mono text-[10px] uppercase text-zinc-400 dark:text-zinc-500">
                  {active.destination}
                </p>
                <p className="font-mono text-[10px] uppercase text-zinc-500 dark:text-zinc-400">
                  {active.sourceInfo}
                </p>

                <h3 className="mt-3 text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                  {active.name}
                </h3>

                <p className="mt-3 text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-400">
                  {active.description}
                </p>

                {/* Avoidance box */}
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-[#112419] dark:text-emerald-300">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-400 block mb-1">
                    WHAT TO DO:
                  </span>
                  {active.avoidanceTip}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-white/5">
                <span className="font-mono text-[10px] uppercase text-zinc-400 dark:text-zinc-500">
                  TRAVELRADAR SIGNAL · LIVE INTELLIGENCE
                </span>
                <span className="font-mono text-sm font-bold text-[#e5283b]">
                  {active.loss}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}