"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Magic UI-style "card spotlight" — a soft radial glow that follows the
 * cursor across the card surface. Wrap content as children.
 */
export function CardGlow({
  children,
  className,
  glowColor = "rgba(229, 72, 74, 0.14)",
  borderColor = "rgba(229, 72, 74, 0.35)",
  radius = 380,
}) {
  const mouseX = useMotionValue(-radius * 2);
  const mouseY = useMotionValue(-radius * 2);
  const ref = useRef(null);

  function handleMouseMove({ clientX, clientY }) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(clientX - rect.left);
    mouseY.set(clientY - rect.top);
  }

  function handleMouseLeave() {
    mouseX.set(-radius * 2);
    mouseY.set(-radius * 2);
  }

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, ${glowColor}, transparent 70%)`;
  const border = useMotionTemplate`radial-gradient(${radius * 0.7}px circle at ${mouseX}px ${mouseY}px, ${borderColor}, transparent 70%)`;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group/card relative h-full overflow-hidden rounded-[1.1rem] border border-white/10 bg-white/[0.045] p-[0.3rem] transition-shadow duration-300",
        className,
      )}
    >
      {/* cursor-tracking border sheen */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[1.1rem] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background: border,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          padding: "1px",
        }}
      />
      {/* cursor-tracking surface glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{ background }}
      />
      <div className="relative h-full rounded-[0.8rem] bg-[#141418] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        {children}
      </div>
    </div>
  );
}