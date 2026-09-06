"use client";

import { motion } from "framer-motion";

/**
 * Bezel panel — nested rounded surfaces, now with a staggered
 * scroll-entrance micro-interaction.
 */
export function Panel({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-32px" }}
      transition={{ duration: 0.55, delay, ease: [0.23, 1, 0.32, 1] }}
      className={`rounded-[1.1rem] border border-white/10 bg-white/[0.045] p-[0.3rem] ${className}`}
    >
      <div className="h-full rounded-[0.8rem] bg-[#141418] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        {children}
      </div>
    </motion.div>
  );
}