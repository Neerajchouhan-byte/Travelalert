"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Check,
  Database,
  FileText,
  MapPin,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

const stages = [
  {
    number: "01",
    label: "Search",
    icon: Search,
    title: "Start with a place, not a rabbit hole.",
    text: "Tell us where you are going and what you need to know before you land.",
  },
  {
    number: "02",
    label: "Collect",
    icon: Database,
    title: "We listen to travelers on the ground.",
    text: "Fresh trip reports and firsthand warnings are collected from public conversations.",
  },
  {
    number: "03",
    label: "Organize",
    icon: Bot,
    title: "Noise becomes a useful signal.",
    text: "AI groups repeated patterns, checks severity, and turns scattered posts into clear actions.",
  },
  {
    number: "04",
    label: "Brief",
    icon: Check,
    title: "You get the part worth remembering.",
    text: "A focused destination briefing tells you what to watch, what to pay, and what to skip.",
  },
];

const reports = [
  "Taxi quoted 900 THB from the airport",
  "Driver said the temple was closed",
  "ATM swallowed my card near Old Town",
];

export default function Howitwork() {
  const [activeStage, setActiveStage] = useState(2);

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveStage((stage) => (stage + 1) % stages.length),
      3600,
    );
    return () => window.clearInterval(timer);
  }, []);

  const stage = stages[activeStage];
  const StageIcon = stage.icon;

  return (
    <section
      id="how"
      className="py-20 sm:py-28 border-b border-zinc-200/80 dark:border-white/5"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header — matches Features.js / SignalOverview.js exactly */}
        <div className="reveal">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#e5283b]">
            — HOW IT WORKS
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Real data.{" "}
            <span className="text-[#e5283b]">Useful in seconds.</span>
          </h2>
          <p className="mt-2 max-w-xl text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
            TravelRadar turns a noisy travel internet into one calm, practical
            read before you go.
          </p>
        </div>

        {/* Main panel — same border / radius / background as Features & Scamcards */}
        <div className="reveal mt-10 rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-xs sm:p-6 lg:p-8 dark:border-white/10 dark:bg-[#141418]">
          {/* Top status bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-4 dark:border-white/5">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>Processing live reports</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              TravelRadar / Pipeline 01
            </span>
          </div>

          {/* Flow: Raw Signals → AI Engine → Your Briefing */}
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-stretch">
            {/* Raw signals */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 lg:flex-1 dark:border-white/10 dark:bg-[#18181f]">
              <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                <span>Raw signals</span>
                <FileText className="size-3.5" />
              </div>

              <div className="mt-3 space-y-2">
                {reports.map((report, index) => (
                  <motion.div
                    key={report}
                    className="rounded-xl border border-zinc-200/90 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]"
                    animate={{
                      x: activeStage === 1 ? [0, 5, 0] : 0,
                      opacity: activeStage === 1 ? 1 : 0.85,
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: activeStage === 1 ? Infinity : 0,
                      delay: index * 0.15,
                    }}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      r/travel
                    </p>
                    <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
                      {report}
                    </p>
                  </motion.div>
                ))}
              </div>

              <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                3,842 posts / 24h
              </p>
            </div>

            {/* Arrow (desktop only) */}
            <div className="hidden items-center justify-center lg:flex">
              <ArrowRight className="size-4 text-zinc-300 dark:text-zinc-600" />
            </div>

            {/* AI engine */}
            <motion.div
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/60 p-4 text-center lg:w-44 lg:shrink-0 dark:border-red-900/40 dark:bg-[#201518]"
              animate={{ scale: activeStage === 2 ? [1, 1.04, 1] : 1 }}
              transition={{
                duration: 1.8,
                repeat: activeStage === 2 ? Infinity : 0,
              }}
            >
              <div className="flex size-12 items-center justify-center rounded-full border border-red-200 bg-white text-[#e5283b] dark:border-red-800/40 dark:bg-[#2b1013] dark:text-[#f87171]">
                <Sparkles className="size-5" />
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                AI synthesis
              </span>
              <strong className="text-[11px] font-bold text-zinc-900 dark:text-white">
                Finding the pattern
              </strong>
            </motion.div>

            {/* Arrow (desktop only) */}
            <div className="hidden items-center justify-center lg:flex">
              <ArrowRight className="size-4 text-zinc-300 dark:text-zinc-600" />
            </div>

            {/* Output briefing */}
            <motion.div
              className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 lg:flex-1 dark:border-white/10 dark:bg-[#18181f]"
              animate={{ y: activeStage === 3 ? [0, -4, 0] : 0 }}
              transition={{
                duration: 2.2,
                repeat: activeStage === 3 ? Infinity : 0,
              }}
            >
              <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                <span>Your briefing</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Ready
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white">
                <MapPin className="size-3.5 text-[#e5283b] dark:text-[#f87171]" />
                <span>Bangkok, Thailand</span>
              </div>

              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-[#261215]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="size-3.5 shrink-0 text-[#e5283b] dark:text-[#f87171]" />
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    Gem-store pressure
                  </p>
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#e5283b] dark:text-[#f87171]">
                  High risk · Reported 4× this week
                </p>
              </div>

              <div className="mt-3 flex items-start gap-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                <Check className="mt-0.5 size-3 shrink-0" />
                <span>Refuse free tuk-tuk offers. Use Grab.</span>
              </div>
            </motion.div>
          </div>

          {/* Stage selector + explainer */}
          <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-white/5">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Briefing process stages"
            >
              {stages.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeStage === index;
                return (
                  <button
                    key={item.number}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveStage(index)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                      isActive
                        ? "border-red-200 bg-red-50 text-[#e5283b] dark:border-red-900/40 dark:bg-[#201518] dark:text-[#f87171]"
                        : "border-zinc-200/90 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-[#16161b] dark:text-zinc-400 dark:hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] ${
                        isActive
                          ? "text-[#e5283b] dark:text-[#f87171]"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    >
                      {item.number}
                    </span>
                    <Icon className="size-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={stage.number}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="mt-4 flex items-start gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-[#18181f]"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-[#e5283b] dark:border-red-900/40 dark:bg-[#201518] dark:text-[#f87171]">
                  <StageIcon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    {stage.number} / {stage.label}
                  </span>
                  <h3 className="mt-0.5 text-base font-black tracking-tight text-zinc-900 dark:text-white">
                    {stage.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500 sm:text-sm dark:text-zinc-400">
                    {stage.text}
                  </p>
                </div>
                <ArrowRight className="mt-2 hidden size-4 shrink-0 text-[#e5283b] sm:block dark:text-[#f87171]" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}