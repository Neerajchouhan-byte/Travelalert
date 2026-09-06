"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Panel } from "./Panel";

const TONE = {
  high: { dot: "#e5484a", chip: "bg-[rgba(229,72,74,0.18)] text-[#e5484a]" },
  medium: { dot: "#f0a63d", chip: "bg-[rgba(240,166,61,0.18)] text-[#f0a63d]" },
  tip: { dot: "#3ecf8e", chip: "bg-[rgba(62,207,142,0.18)] text-[#3ecf8e]" },
  low: { dot: "#3ecf8e", chip: "bg-[rgba(62,207,142,0.18)] text-[#3ecf8e]" },
};

export function RecentActivity({ city, alerts = [], loading }) {
  const rows = alerts.slice(0, 5);

  return (
    <Panel delay={0.1}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Activity className="size-4 text-[#e5484a]" />
          Recent for {city}
        </div>
        <span className="live-dot" />
      </div>
      <div className="relative p-3">
        {/* timeline rail */}
        {rows.length > 0 && !loading && (
          <div className="absolute bottom-6 left-[1.65rem] top-6 w-px bg-white/10" />
        )}
        {loading && (
          <p className="px-2 py-3 text-xs text-[#a6a6ad]">Loading…</p>
        )}
        {!loading && rows.length === 0 && (
          <p className="px-2 py-3 text-xs text-[#a6a6ad]">
            No live reports yet.
          </p>
        )}
        {rows.map((a, i) => {
          const sev = (a.severity || "medium").toLowerCase();
          const tone = TONE[sev] || TONE.medium;
          return (
            <motion.div
              key={a.name + i}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.07,
                type: "spring",
                stiffness: 160,
                damping: 20,
              }}
              className="relative flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.04]"
            >
              <span
                className="relative z-10 size-2.5 shrink-0 rounded-full ring-4 ring-[#141418]"
                style={{ background: tone.dot }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{a.name}</div>
                <div className="truncate text-[11px] text-[#a6a6ad]">
                  {a.description || a.desc || city}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${tone.chip}`}
              >
                {sev}
              </span>
            </motion.div>
          );
        })}
      </div>
    </Panel>
  );
}