"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

const NUM_RE = /^(\D*?)(-?\d+(?:\.\d+)?)(.*)$/;

/**
 * Animated numeric readout — spring-driven count-up when scrolled into view.
 * Non-numeric values simply fade in. Preserves prefix/suffix ("32°C", "$9").
 */
export function AnimatedNumber({
  value,
  decimals,
  className = "",
  duration = 1.1,
  delay = 0,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-24px" });
  const [display, setDisplay] = useState(null);

  const match =
    typeof value === "string" || typeof value === "number"
      ? String(value).match(NUM_RE)
      : null;

  useEffect(() => {
    if (!match || !inView) return;
    const target = parseFloat(match[2]);
    const dp =
      decimals != null ? decimals : (match[2].split(".")[1] || "").length;

    const controls = animate(0, target, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        setDisplay(`${match[1]}${v.toFixed(dp)}${match[3]}`);
      },
    });
    return () => controls.stop();
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!match) {
    return (
      <span
        ref={ref}
        className={`inline-block motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-700 ${className}`}
      >
        {value}
      </span>
    );
  }

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {display ?? `${match[1]}0${match[3]}`}
    </span>
  );
}