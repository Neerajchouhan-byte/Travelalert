"use client";

import { motion } from "framer-motion";
import Searchbar from "./Searchbar";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24" id="hero">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        
        {/* Left copy */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-red-900/40 bg-[#2b1013] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#f87171]"
          >
            <span className="size-1.5 rounded-full bg-[#e5283b] animate-pulse" />
            <span>LIVE DESTINATION BRIEFS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-[58px] leading-[1.08]"
          >
            Know before you go. <br />
            <span className="text-[#e5283b]">Not after you&apos;re scammed.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base"
          >
            The average tourist loses $180 to scams on day one. Real traveler
            reports, organized by AI, before you land.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="mt-8"
          >
            <Searchbar />
          </motion.div>
        </div>

        {/* Right Radar Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
          className="relative mx-auto flex size-72 items-center justify-center sm:size-96 lg:col-span-5"
        >
          {/* Concentric rings */}
          <div className="absolute inset-0 rounded-full border border-white/5" />
          <div className="absolute inset-8 rounded-full border border-white/5" />
          <div className="absolute inset-16 rounded-full border border-white/10" />
          <div className="absolute inset-24 rounded-full border border-red-900/20" />

          {/* Crosshairs */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/5" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />

          {/* Rotating radar sweep */}
          <div className="radar-sweep absolute inset-0 rounded-full" />

          {/* Glowing Center Dot */}
          <div className="relative z-10 size-3 rounded-full bg-[#e5283b] shadow-[0_0_16px_rgba(229,40,59,0.9)]" />

          {/* Blip locations */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <span className="size-2 rounded-full bg-[#e5283b] animate-blip" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Rome</span>
          </div>

          <div className="absolute right-12 top-24 flex flex-col items-center gap-1">
            <span className="size-2 rounded-full bg-[#e5283b] animate-blip [animation-delay:0.4s]" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Bangkok</span>
          </div>

          <div className="absolute bottom-16 right-16 flex flex-col items-center gap-1">
            <span className="size-2 rounded-full bg-[#e5283b] animate-blip [animation-delay:0.8s]" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Bali</span>
          </div>

          <div className="absolute bottom-20 left-12 flex flex-col items-center gap-1">
            <span className="size-2 rounded-full bg-[#e5283b] animate-blip [animation-delay:1.2s]" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Tokyo</span>
          </div>

          <div className="absolute top-28 left-8 flex flex-col items-center gap-1">
            <span className="size-2 rounded-full bg-[#e5283b] animate-blip [animation-delay:1.6s]" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Prague</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}