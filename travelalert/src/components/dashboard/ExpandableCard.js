"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Lock } from "lucide-react";

const spring = { type: "spring", stiffness: 260, damping: 28 };

export function ExpandableCard({
  title,
  badge,
  preview,
  children,
  locked = false,
  accent = "medium",
  index = 0,
}) {
  const [open, setOpen] = useState(false);

  const bar = {
    high: "bg-[#e5484a]",
    medium: "bg-[#f0a63d]",
    tip: "bg-[#3ecf8e]",
    low: "bg-[#3ecf8e]",
  }[accent] || "bg-[#f0a63d]";

  const badgeCls = {
    high: "bg-[rgba(229,72,74,0.18)] text-[#e5484a]",
    medium: "bg-[rgba(240,166,61,0.18)] text-[#f0a63d]",
    tip: "bg-[rgba(62,207,142,0.18)] text-[#3ecf8e]",
    low: "bg-[rgba(62,207,142,0.18)] text-[#3ecf8e]",
  }[accent] || "bg-white/10 text-[#a6a6ad]";

  if (locked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="relative select-none overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
      >
        <div className={`absolute inset-y-0 left-0 w-1 ${bar} opacity-40`} />
        <div className="flex items-center gap-3 px-4 py-3 pl-5">
          <div className="min-w-0 flex-1 blur-[3px]">
            <p className="truncate text-sm font-semibold">{title}</p>
            {preview && (
              <p className="mt-0.5 truncate text-xs text-[#a6a6ad]">{preview}</p>
            )}
          </div>
          <Lock className="size-3.5 shrink-0 text-[#68686f]" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -2 }}
      className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20 hover:bg-white/[0.05]"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-3 py-3 text-left sm:px-4"
      >
        <motion.span
          animate={open ? { scale: [1, 1.5, 1] } : { scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`mt-1.5 size-1.5 shrink-0 rounded-full ${bar}`}
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold leading-snug">{title}</span>
            {badge && (
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${badgeCls}`}
              >
                {badge}
              </span>
            )}
          </span>
          <AnimatePresence initial={false}>
            {!open && preview && (
              <motion.span
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-1 block overflow-hidden text-xs leading-relaxed text-[#a6a6ad]"
              >
                <span className="line-clamp-2">{preview}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={spring}
          className="mt-0.5 shrink-0 text-[#68686f]"
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </button>

      {/* height-auto spring expansion */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 px-3 pb-3 pt-2 sm:px-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}