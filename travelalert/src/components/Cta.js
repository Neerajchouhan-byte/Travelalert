"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function Cta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-gradient-to-b from-red-50 to-white px-6 py-16 text-center shadow-lg sm:px-12 dark:border-white/10 dark:from-[#241114] dark:to-[#121216]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-red-600/10 blur-3xl dark:bg-red-900/20" />

          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#e5283b] dark:text-[#f87171]">
            CHECK BEFORE YOU LAND
          </span>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl dark:text-white">
            Don&apos;t be the tourist{" "}
            <span className="text-[#e5283b]">who finds out after.</span>
          </h2>

          <p className="mx-auto mt-3 max-w-md text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
            Takes 30 seconds. Could save you $180 on day one.
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href="#hero"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#e5283b] px-6 text-sm font-bold text-white shadow-lg shadow-red-900/30 transition hover:bg-[#d32032] active:scale-95"
            >
              <span>Scan now</span>
              <ChevronRight className="size-4" />
            </a>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
            <span className="size-1.5 rounded-full bg-[#e5283b]" />
            Smart travelers check before they fly.
          </p>
        </motion.div>
      </div>
    </section>
  );
}