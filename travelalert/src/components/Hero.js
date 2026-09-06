"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Searchbar from "./Searchbar";
import { Spotlight, DotGrid } from "@/components/ui/spotlight";

const fieldNotes = [
  {
    id: "07",
    city: "Bangkok",
    code: "TH / BKK",
    live: "LIVE / 04:28",
    risk: "HIGH RISK",
    reports: "4 REPORTS / 7D",
    change: "+18%",
    summary:
      "Gem-store pressure reported four times this week near the Grand Palace.",
    detail: "Refuse free tuk-tuk offers and use the Grab app for fixed fares.",
  },
  {
    id: "08",
    city: "Prague",
    code: "CZ / PRG",
    live: "UPDATED / 12M",
    risk: "WATCH",
    reports: "3 REPORTS / 7D",
    change: "+9%",
    summary: "Standalone ATM skimmers spotted around Old Town Square.",
    detail:
      "Use an ATM inside a bank branch and cover the keypad while entering your PIN.",
  },
  {
    id: "09",
    city: "Bali",
    code: "ID / DPS",
    live: "UPDATED / 31M",
    risk: "ELEVATED",
    reports: "6 REPORTS / 7D",
    change: "+14%",
    summary:
      "Motorbike renters reporting fresh damage claims after returning vehicles.",
    detail:
      "Photograph every panel and the odometer before leaving the rental shop.",
  },
];

export default function Hero() {
  const [activeNote, setActiveNote] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-rotate the intel deck; pauses on hover/focus or after user interaction
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setActiveNote((n) => (n + 1) % fieldNotes.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  const select = useCallback((index) => {
    setActiveNote(index);
    setPaused(true);
  }, []);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      setPaused(true);
      setActiveNote((n) =>
        e.key === "ArrowDown"
          ? (n + 1) % fieldNotes.length
          : (n - 1 + fieldNotes.length) % fieldNotes.length,
      );
    },
    [],
  );

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

          <div
            className="hero-intel-deck"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onKeyDown={onKeyDown}
          >
            {fieldNotes.map((note, index) => {
              const isActive = activeNote === index;
              return (
                <button
                  type="button"
                  className={`hero-intel ${isActive ? "is-active" : ""}`}
                  key={note.id}
                  onClick={() => select(index)}
                  aria-expanded={isActive}
                  style={{ "--stack-index": index }}
                >
                  <span className="hero-intel-head">
                    <span>FIELD NOTE {note.id}</span>
                    <span className="hero-intel-live">
                      <span className="live-dot"></span>
                      {note.live}
                    </span>
                  </span>
                  <span className="hero-intel-place">
                    <span>{note.city}</span>
                    <small>{note.code}</small>
                  </span>
                  <span className="hero-intel-summary">{note.summary}</span>
                  <span className="hero-intel-detail">{note.detail}</span>
                  <span className="hero-intel-foot">
                    <span>
                      <i className="hero-risk-dot"></i>
                      {note.risk}
                    </span>
                    <span>{note.reports}</span>
                    <b>{note.change}</b>
                  </span>
                  <span className="hero-intel-open" aria-hidden="true">
                    {isActive ? "-" : "+"}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}