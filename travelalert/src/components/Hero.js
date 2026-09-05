"use client";

import { useState } from "react";
import Searchbar from "./Searchbar";

const fieldNotes = [
  {
    id: "07",
    city: "Bangkok",
    code: "TH / BKK",
    live: "LIVE / 04:28",
    risk: "HIGH RISK",
    reports: "4 REPORTS / 7D",
    change: "+18%",
    summary: "Gem-store pressure reported four times this week near the Grand Palace.",
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
    detail: "Use an ATM inside a bank branch and cover the keypad while entering your PIN.",
  },
  {
    id: "09",
    city: "Bali",
    code: "ID / DPS",
    live: "UPDATED / 31M",
    risk: "ELEVATED",
    reports: "6 REPORTS / 7D",
    change: "+14%",
    summary: "Motorbike renters reporting fresh damage claims after returning vehicles.",
    detail: "Photograph every panel and the odometer before leaving the rental shop.",
  },
];

export default function Hero() {
  const [activeNote, setActiveNote] = useState(0);

  return (
    <section className="hero" id="hero">
      <div className="container hero-grid">
        <div className="hero-left reveal in">
          <span className="eyebrow">
            <span className="live-dot"></span>
            LIVE DESTINATION BRIEFS
          </span>
          <h1>
            <span>Know before you go.</span>
            <span className="grad-accent">Not after you&apos;re scammed.</span>
          </h1>
          <p className="hero-sub">
            The average tourist loses $180 to scams on day one. Real traveler
            reports, organized by AI, before you land.
          </p>
          <Searchbar />
        </div>

        <div
          className="hero-right reveal in"
          style={{ transitionDelay: "150ms" }}
        >
          <div className="radar-wrap">
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
          <div className="hero-intel-deck">
            {fieldNotes.map((note, index) => {
              const isActive = activeNote === index;
              return (
                <button
                  type="button"
                  className={`hero-intel ${isActive ? "is-active" : ""}`}
                  key={note.id}
                  onClick={() => setActiveNote(index)}
                  aria-expanded={isActive}
                  style={{ "--stack-index": index }}
                >
                  <span className="hero-intel-head">
                    <span>FIELD NOTE {note.id}</span>
                    <span className="hero-intel-live"><span className="live-dot"></span>{note.live}</span>
                  </span>
                  <span className="hero-intel-place"><span>{note.city}</span><small>{note.code}</small></span>
                  <span className="hero-intel-summary">{note.summary}</span>
                  <span className="hero-intel-detail">{note.detail}</span>
                  <span className="hero-intel-foot">
                    <span><i className="hero-risk-dot"></i>{note.risk}</span>
                    <span>{note.reports}</span>
                    <b>{note.change}</b>
                  </span>
                  <span className="hero-intel-open" aria-hidden="true">{isActive ? "-" : "+"}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
