"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Banknote, CloudSun, CookingPot, Route, ShieldAlert } from "lucide-react";
import { useState } from "react";

const coverage = [
  { label: "Scam alerts", tag: "WATCH", icon: ShieldAlert, tone: "red", title: "See the expensive mistake before it happens.", body: "Fresh reports are distilled into clear warnings for taxis, tours, ATMs, tickets, and the small traps that do not make it into a guidebook.", metric: "2,400+", metricLabel: "patterns tracked", note: "Reports are refreshed daily" },
  { label: "Weather", tag: "ARRIVE", icon: CloudSun, tone: "blue", title: "Know what the city feels like outside.", body: "Current temperature, UV, humidity, and a useful note about what to wear when you step out of the airport.", metric: "LIVE", metricLabel: "conditions", note: "Updated for your arrival day" },
  { label: "Food", tag: "EAT WELL", icon: CookingPot, tone: "gold", title: "Find the good table, skip the tourist markup.", body: "Local picks, honest ordering advice, and the places travelers mention for the right reasons.", metric: "847", metricLabel: "local picks", note: "Sorted by traveler signal" },
  { label: "Transport", tag: "MOVE", icon: Route, tone: "green", title: "Move through the city with the price in view.", body: "Fair fares, trusted apps, airport routes, and the transport patterns visitors report most often.", metric: "28%", metricLabel: "saved on avg", note: "Compared with curbside rates" },
  { label: "Currency", tag: "PAY", icon: Banknote, tone: "violet", title: "Keep silent fees from becoming the souvenir.", body: "Live local rates and practical ATM advice for the exact moment a card terminal asks you to choose a currency.", metric: "0%", metricLabel: "guesswork", note: "Local rate checked live" },
];

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = coverage[activeIndex];
  const ActiveIcon = active.icon;

  return (
    <section id="features">
      <div className="container">
        <div className="sec-head reveal">
          <span className="eyebrow">What we cover</span>
          <h2>One briefing. <span className="grad-accent">Fewer unknowns.</span></h2>
          <p className="sec-sub">Choose the decision you are about to make. TravelRadar gives you useful context without making you read a guidebook.</p>
        </div>
        <div className="coverage-workspace reveal">
          <nav className="coverage-index" aria-label="Briefing sections">
            <div className="coverage-index-label"><span>BRIEFING MODULES</span><span>0{coverage.length}</span></div>
            {coverage.map((item, index) => {
              const Icon = item.icon;
              return <button type="button" key={item.label} className={`coverage-index-item ${index === activeIndex ? "is-active" : ""}`} onClick={() => setActiveIndex(index)} aria-pressed={index === activeIndex}><span className="coverage-index-count">0{index + 1}</span><Icon size={16} /><span>{item.label}</span><span className="coverage-index-arrow">{index === activeIndex ? "CURRENT" : "VIEW"}</span></button>;
            })}
            <div className="coverage-index-footer"><span className="live-dot" /> Briefing signal online</div>
          </nav>
          <AnimatePresence mode="wait">
            <motion.article className={`coverage-pane ${active.tone}`} key={active.label} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.22 }}>
              <div className="coverage-pane-glow" />
              <div className="coverage-pane-top"><span>{active.tag} / MODULE 0{activeIndex + 1}</span><ActiveIcon size={20} /></div>
              <div className="coverage-pane-content"><h3>{active.title}</h3><p>{active.body}</p></div>
              <div className="coverage-pane-bottom"><div><strong>{active.metric}</strong><span>{active.metricLabel}</span></div><span className="coverage-pane-note">{active.note}</span></div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
