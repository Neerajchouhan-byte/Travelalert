"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock3, MapPin, ShieldAlert } from "lucide-react";
import { useState } from "react";

const scams = [
  {
    destination: "Bangkok, Thailand",
    badge: "High risk",
    sevClass: "high",
    loss: "$200",
    name: "Tuk-Tuk Free Temple Tour",
    description: "A friendly local near the Grand Palace offers a free tuk-tuk tour, then drives you to gem shops with heavy pressure to buy.",
    avoidanceTip: "Refuse all 'free tour' offers. Use the Grab app only.",
    sourceInfo: "REPORTED 4X THIS WEEK &middot; 847 UPVOTES",
    wide: true,
  },
  {
    destination: "Bali, Indonesia",
    badge: "High risk",
    sevClass: "high",
    loss: "$150",
    name: "Motorbike Damage Claim",
    description: "Rental returned, owner claims new damage and demands cash, refusing insurance.",
    avoidanceTip: "Photo every scratch before riding.",
    sourceInfo: "REPORTED 6X THIS WEEK",
  },
  {
    destination: "Prague, Czechia",
    badge: "Medium",
    sevClass: "medium",
    loss: "$400",
    name: "ATM Skimming Device",
    description: "Skimmers found on standalone ATMs near Old Town Square. Cards cloned within hours.",
    avoidanceTip: "Use bank-branch ATMs. Cover the keypad.",
    sourceInfo: "CONFIRMED THIS WEEK",
  },
  {
    destination: "Hanoi, Vietnam",
    badge: "Medium",
    sevClass: "medium",
    loss: "$25",
    name: "Taxi No-Meter Scam",
    description: "Driver claims a broken meter, then charges 3 to 5x fare, common late night at Noi Bai.",
    avoidanceTip: "Use Grab. Agree the price first.",
    sourceInfo: "REPORTED 9X THIS WEEK",
  },
  {
    destination: "Bangkok, Thailand",
    badge: "Tip",
    sevClass: "tip",
    loss: "$45",
    name: "Best Transport From the Airport",
    description: "Download Grab before landing. Fixed price around 280 THB, versus street taxis charging 800 to 1200 THB.",
    avoidanceTip: "Book Grab before leaving the arrivals hall.",
    sourceInfo: "3.4K UPVOTES &middot; VERIFIED TIP",
  },
];

export default function Scamcards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = scams[activeIndex];

  return (
    <section id="scams" style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <div className="sec-head reveal">
          <h2>Active right now. <span className="grad-accent">Updated daily.</span></h2>
          <p className="sec-sub">Every alert below is sourced from real traveler reports this week, not a 2019 blog post.</p>
        </div>
        <div className="signal-board">
          <div className="signal-rail" aria-label="Related live alerts">
            <div className="signal-rail-head"><span>Related signals</span><span>{scams.length} LIVE</span></div>
            {scams.map((scam, index) => (
              <button type="button" className={`signal-rail-item ${index === activeIndex ? "is-active" : ""}`} key={scam.name} onClick={() => setActiveIndex(index)}>
                <span className="signal-rail-number">0{index + 1}</span>
                <span className="signal-rail-copy"><b>{scam.name}</b><small>{scam.destination}</small></span>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.article className="signal-feature" key={active.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <div className="signal-feature-top">
                <span className={`signal-severity ${active.sevClass}`}><ShieldAlert size={14} />{active.badge}</span>
                <span className="signal-index">0{activeIndex + 1} / 0{scams.length}</span>
              </div>
              <div className="signal-feature-body">
                <div className="signal-feature-meta"><span><MapPin size={14} />{active.destination}</span><span><Clock3 size={14} />{active.sourceInfo.replace(/&middot;/g, "·")}</span></div>
                <h3>{active.name}</h3>
                <p>{active.description}</p>
                <div className="signal-avoid"><ShieldAlert size={16} /><span><b>What to do</b>{active.avoidanceTip}</span></div>
              </div>
              <div className="signal-feature-foot"><span>TRAVELRADAR SIGNAL / LIVE INTELLIGENCE</span><b>{active.loss} <small>avg loss</small></b></div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
