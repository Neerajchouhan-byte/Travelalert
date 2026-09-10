"use client";

import { useEffect } from "react";

/**
 * Runs the landing-page scroll-reveal observer. Extracted from src/app/page.js
 * so that page can be a server component (metadata exports require it).
 *
 * The effect body below is byte-for-byte the same as the version that used to
 * live in src/app/page.js — no changes to the observer logic.
 */
export function HomeRevealObserver() {
  useEffect(() => {
    // True scroll-triggered reveals: each .reveal element animates in
    // the first time it enters the viewport, with --i stagger support.
    const nodes = document.querySelectorAll(".reveal:not(.in)");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const node = entry.target;
          const stagger =
            Number(node.style.getPropertyValue("--i") || 0) * 80;
          node.style.transitionDelay = `${stagger}ms`;
          node.classList.add("in");
          observer.unobserve(node);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return null;
}