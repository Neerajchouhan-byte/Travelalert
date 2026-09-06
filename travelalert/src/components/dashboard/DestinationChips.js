"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { Panel } from "./Panel";
import { cities } from "@/lib/dashboard-data";

export function DestinationChips({ active }) {
  const router = useRouter();

  return (
    <Panel delay={0.15}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Compass className="size-4 text-[#5b9dee]" />
          Popular destinations
        </div>
        <span className="hidden font-mono text-[11px] text-[#68686f] sm:inline">
          POPULAR
        </span>
      </div>
      <div className="flex flex-wrap gap-2 p-4">
        {cities.map((c, i) => {
          const isActive = c.name === active;
          return (
            <motion.button
              key={c.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                router.push(`/dashboard?city=${encodeURIComponent(c.name)}`)
              }
              className={`relative inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? "border-transparent text-[#e5484a]"
                  : "border-white/10 bg-[#141418] text-[#a6a6ad] hover:text-[#f3f3f2]"
              }`}
            >
              {/* sliding active pill */}
              {isActive && (
                <motion.span
                  layoutId="dest-chip-active"
                  className="absolute inset-0 rounded-full border border-[rgba(229,72,74,0.4)] bg-[rgba(229,72,74,0.14)]"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span className="relative">{c.flag}</span>
              <span className="relative">{c.name}</span>
              <span
                className={`relative font-mono text-[11px] ${
                  c.tone === "good" ? "text-[#3ecf8e]" : "text-[#f0a63d]"
                }`}
              >
                {c.score}
              </span>
            </motion.button>
          );
        })}
      </div>
    </Panel>
  );
}