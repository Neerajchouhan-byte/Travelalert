"use client";

import { useEffect } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Features from "@/components/Features";
import Test from "@/components/Test";
import Cta from "@/components/Cta";
import Howitwork from "@/components/Howitwork";
import Pricing from "@/components/Pricing";
import SignalOverview from "@/components/SignalOverview";
import Scamcards from "@/components/Scamcards";

export default function Home() {
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <Howitwork />
      <SignalOverview />
      <Scamcards />
      <Pricing />
      <Test />
      <Cta />
      <Footer />
    </>
  );
}