"use client";

import { motion } from "framer-motion";
import Searchbar from "./Searchbar";
import { Spotlight, DotGrid } from "@/components/ui/spotlight";

export default function Hero() {
  return (
    <section className="hero relative overflow-hidden" id="hero">
      {/* Ambient light + grid — matches the dashboard language */}
      <Spotlight id="hero-spotlight" className="-top-64 left-1/2 -translate-x-1/2" />
      <DotGrid className="absolute inset-0" />

      <div className="container hero-grid relative">
        <div className="hero-left">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="live-dot"></span>
            LIVE DESTINATION BRIEFS
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            <span>Know before you go.</span>
            <span className="grad-accent">
              Not after you’re scammed.
            </span>
          </motion.h1>
          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
          >
            The average tourist loses $180 to scams on day one. Real traveler
            reports, organized by AI, before you land.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
          >
            <Searchbar />
          </motion.div>
        </div>

        <motion.div
          className="hero-right"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
        >
          <div className="radar-wrap" aria-hidden="true">
            <div className="radar-ring"></div>
            <div className="radar-ring r2"></div>
            <div className="radar-ring r3"></div>
            <div className="radar-ring r4"></div>
            <div
              className="radar-crosshair"
              style={{ position: "absolute", inset: 0 }}
            ></div>
            <div className="radar-sweep"></div>
            <div className="radar-core"></div>
            <div className="blip b1">
              <span className="dot"></span>
              <span className="lbl">Bangkok</span>
            </div>
            <div className="blip b2">
              <span className="dot"></span>
              <span className="lbl">Bali</span>
            </div>
            <div className="blip b3">
              <span className="dot"></span>
              <span className="lbl">Rome</span>
            </div>
            <div className="blip b4">
              <span className="dot"></span>
              <span className="lbl">Prague</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}