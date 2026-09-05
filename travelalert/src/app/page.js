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
    const nodes = document.querySelectorAll(".reveal");
    const revealNodes = Array.from(nodes);

    revealNodes.forEach((node, index) => {
      const delay = node.style.getPropertyValue("--i") ? Number(node.style.getPropertyValue("--i")) * 80 : index * 80;
      node.style.transitionDelay = `${delay}ms`;
      requestAnimationFrame(() => {
        node.classList.add("in");
      });
    });
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
