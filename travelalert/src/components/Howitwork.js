"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const stages = [
  { number: "01", label: "Search" },
  { number: "02", label: "Collect" },
  { number: "03", label: "Organize" },
  { number: "04", label: "Brief" },
];

export default function Howitwork() {
  const [activeStage, setActiveStage] = useState(1);

  // Restored 3600ms stage interval loop
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="how" className="py-20 sm:py-28 border-b border-zinc-200/80 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="reveal">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#e5283b]">
            HOW THE BRIEFING IS MADE
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Real data. <span className="text-[#e5283b]">Useful in seconds.</span>
          </h2>
          <p className="mt-2 max-w-xl text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
            TravelRadar turns a noisy travel internet into one calm, practical
            brief before you go.
          </p>
        </div>

        {/* Restored Pipeline Visual with Motion */}
        <div className="reveal mt-10 rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-[#141418]">
          
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            
            {/* Box 1: Raw Signals */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 lg:col-span-5 space-y-2 dark:border-white/10 dark:bg-[#18181f]">
              <span className="font-mono text-[10px] uppercase text-zinc-400 dark:text-zinc-500">
                RAW SIGNALS
              </span>
              <div className="space-y-2 pt-1">
                {["Taxi quoted 900 THB from the airport", "Driver said the temple was closed", "ATM swallowed my card near Old Town"].map((post, idx) => (
                  <motion.div
                    key={post}
                    animate={{
                      x: activeStage === 1 ? [0, 4, 0] : 0,
                      opacity: activeStage === 1 ? 1 : 0.8,
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: activeStage === 1 ? Infinity : 0,
                      delay: idx * 0.15,
                    }}
                    className="rounded-lg bg-white p-2.5 text-xs text-zinc-700 shadow-2xs dark:bg-white/5 dark:text-zinc-300"
                  >
                    <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                      r/travel ·{" "}
                    </span>
                    {post}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Restored Rotating AI Engine in Center */}
            <div className="relative flex flex-col items-center justify-center lg:col-span-2 py-2">
              <motion.div
                animate={{ scale: activeStage === 2 ? [1, 1.06, 1] : 1 }}
                transition={{ duration: 1.8, repeat: activeStage === 2 ? Infinity : 0 }}
                className="relative flex size-16 items-center justify-center rounded-full border border-red-200 bg-red-50 text-[#e5283b] dark:border-red-800/40 dark:bg-[#2b1013]"
              >
                <div className="lab-engine-orbit" />
                <div className="lab-engine-orbit orbit-b" />
                <Sparkles className="size-6" />
              </motion.div>
              <span className="mt-2 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                AI Synthesis
              </span>
            </div>

            {/* Box 2: Your Briefing */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 lg:col-span-5 space-y-3 dark:border-white/10 dark:bg-[#18181f]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase text-zinc-400 dark:text-zinc-500">
                  YOUR BRIEFING
                </span>
                <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  ● READY
                </span>
              </div>
              <motion.div
                animate={{ y: activeStage === 3 ? [0, -3, 0] : 0 }}
                transition={{ duration: 2, repeat: activeStage === 3 ? Infinity : 0 }}
                className="rounded-xl border border-red-200 bg-red-50 p-3.5 dark:border-red-900/40 dark:bg-[#261215]"
              >
                <p className="text-xs font-bold text-zinc-900 dark:text-white">
                  Gem-store pressure
                </p>
                <p className="font-mono text-[10px] text-[#e5283b] uppercase dark:text-red-400">
                  HIGH RISK · REPORTED 4X THIS WEEK
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <Check className="size-3.5" /> Refuse free tuk-tuk offers. Use Grab.
                </p>
              </motion.div>
            </div>

          </div>

          {/* Steps selector */}
          <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-white/5">
            <div className="flex flex-wrap gap-2">
              {stages.map((st, i) => (
                <button
                  key={st.number}
                  type="button"
                  onClick={() => setActiveStage(i)}
                  className={`rounded-full px-4 py-1.5 font-mono text-xs font-bold transition ${
                    activeStage === i
                      ? "bg-red-50 text-[#e5283b] border border-red-200 dark:bg-[#2b1013] dark:text-[#f87171] dark:border-red-900/50"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300"
                  }`}
                >
                  {st.number} {st.label}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
              We listen to travelers on the ground. Fresh trip reports and
              firsthand warnings are collected from public conversations.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}