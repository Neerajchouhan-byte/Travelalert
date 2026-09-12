"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

const signalData = [
  { day: "Mon", reports: 28 },
  { day: "Tue", reports: 34 },
  { day: "Wed", reports: 32 },
  { day: "Thu", reports: 46 },
  { day: "Fri", reports: 42 },
  { day: "Sat", reports: 68 },
  { day: "Sun", reports: 72 },
];

export default function SignalOverview() {
  return (
    <section className="py-20 sm:py-28 border-b border-zinc-200/80 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">

          {/* Left copy */}
          <div className="reveal lg:col-span-6">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#e5283b]">
              — INTELLIGENCE FEED
            </span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
              A clearer read on <span className="text-[#e5283b]">what is changing.</span>
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500 sm:text-sm dark:text-zinc-400">
              We track traveler reports across Reddit for each destination, then use AI
              to turn scattered posts into scam alerts and tips you can actually use.
            </p>

            <div className="mt-8 flex items-center gap-8 border-t border-zinc-100 pt-6 dark:border-white/5">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="font-mono text-2xl font-black text-zinc-900 sm:text-3xl dark:text-white">
                  50+
                </p>
                <p className="font-mono text-[10px] uppercase text-zinc-400 dark:text-zinc-500">
                  destinations covered
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
              >
                <p className="font-mono text-2xl font-black text-zinc-900 sm:text-3xl dark:text-white">
                  188+
                </p>
                <p className="font-mono text-[10px] uppercase text-zinc-400 dark:text-zinc-500">
                  destinations
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.16 }}
              >
                <p className="font-mono text-2xl font-black text-zinc-900 sm:text-3xl dark:text-white">
                  Zero
                </p>
                <p className="font-mono text-[10px] uppercase text-zinc-400 dark:text-zinc-500">
                  fluff
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Chart Card with Restored motion entrance */}
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-xs lg:col-span-6 dark:border-white/10 dark:bg-[#16161b]"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase text-zinc-400 dark:text-zinc-500">
                  THE LATEST INSIGHTS
                </span>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  Traveler reports this week
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +21.4%
              </span>
            </div>

            <div className="mt-4 h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={signalData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="feedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e5283b" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#e5283b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                  <Area
                    type="monotone"
                    dataKey="reports"
                    stroke="#e5283b"
                    strokeWidth={2}
                    fill="url(#feedFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-3 font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
              Aggregated from across the web · Fresh insights added regularly
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}