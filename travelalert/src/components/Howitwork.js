"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bot, Check, Database, FileText, MapPin, Search, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const stages = [
  { number: "01", label: "Search", icon: Search, title: "Start with a place, not a rabbit hole.", text: "Tell us where you are going and what you need to know before you land." },
  { number: "02", label: "Collect", icon: Database, title: "We listen to travelers on the ground.", text: "Fresh trip reports and firsthand warnings are collected from public conversations." },
  { number: "03", label: "Organize", icon: Bot, title: "Noise becomes a useful signal.", text: "AI groups repeated patterns, checks severity, and turns scattered posts into clear actions." },
  { number: "04", label: "Brief", icon: Check, title: "You get the part worth remembering.", text: "A focused destination briefing tells you what to watch, what to pay, and what to skip." },
];

const reports = ["Taxi quoted 900 THB from the airport", "Driver said the temple was closed", "ATM swallowed my card near Old Town"];

export default function Howitwork() {
  const [activeStage, setActiveStage] = useState(2);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveStage((stage) => (stage + 1) % stages.length), 3600);
    return () => window.clearInterval(timer);
  }, []);

  const stage = stages[activeStage];
  const StageIcon = stage.icon;

  return (
    <section id="how">
      <div className="container">
        <div className="sec-head reveal">
          <span className="eyebrow"><span className="live-dot" /> How the briefing is made</span>
          <h2>Real data. <span className="grad-accent">Useful in seconds.</span></h2>
          <p className="sec-sub">TravelRadar turns a noisy travel internet into one calm, practical read before you go.</p>
        </div>

        <div className="briefing-lab reveal">
          <div className="lab-topline"><span><span className="lab-status-dot" /> PROCESSING LIVE REPORTS</span><span>TRAVELRADAR / PIPELINE 01</span></div>
          <div className="lab-scene">
            <div className="lab-source">
              <div className="lab-source-head"><span>RAW SIGNALS</span><FileText size={14} /></div>
              <div className="lab-report-stack">
                {reports.map((report, index) => <motion.div className="lab-report" key={report} animate={{ x: activeStage === 1 ? [0, 5, 0] : 0, opacity: activeStage === 1 ? 1 : 0.72 }} transition={{ duration: 2.4, repeat: activeStage === 1 ? Infinity : 0, delay: index * 0.15 }}><span>r/travel</span><p>{report}</p></motion.div>)}
              </div>
              <span className="lab-source-foot">3,842 POSTS / 24H</span>
            </div>

            <div className="lab-flow flow-one"><span /></div>
            <motion.div className="lab-engine" animate={{ scale: activeStage === 2 ? [1, 1.04, 1] : 1 }} transition={{ duration: 1.8, repeat: activeStage === 2 ? Infinity : 0 }}>
              <div className="lab-engine-orbit orbit-a" /><div className="lab-engine-orbit orbit-b" />
              <div className="lab-engine-icon"><Sparkles size={20} /></div>
              <span>AI SYNTHESIS</span><strong>Finding the pattern</strong>
            </motion.div>
            <div className="lab-flow flow-two"><span /></div>

            <motion.div className="lab-output" animate={{ y: activeStage === 3 ? [0, -4, 0] : 0 }} transition={{ duration: 2.2, repeat: activeStage === 3 ? Infinity : 0 }}>
              <div className="lab-output-head"><span>YOUR BRIEFING</span><span className="lab-live-pill"><span className="live-dot" /> READY</span></div>
              <div className="lab-output-place"><MapPin size={15} /> Bangkok, Thailand</div>
              <div className="lab-output-alert"><ShieldAlert size={17} /><div><b>Gem-store pressure</b><span>HIGH RISK / REPORTED 4X THIS WEEK</span></div></div>
              <div className="lab-output-tip"><Check size={14} /> Refuse free tuk-tuk offers. Use Grab.</div>
            </motion.div>
          </div>
          <div className="lab-stages" role="tablist" aria-label="Briefing process stages">
            {stages.map((item, index) => { const Icon = item.icon; return <button type="button" role="tab" aria-selected={activeStage === index} className={`lab-stage ${activeStage === index ? "is-active" : ""}`} key={item.number} onClick={() => setActiveStage(index)}><span className="lab-stage-number">{item.number}</span><Icon size={15} /><span>{item.label}</span></button>; })}
          </div>
          <AnimatePresence mode="wait"><motion.div className="lab-explainer" key={stage.number} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}><div className={`lab-explainer-icon stage-${activeStage}`}><StageIcon size={18} /></div><div><span>{stage.number} / {stage.label}</span><h3>{stage.title}</h3><p>{stage.text}</p></div><ArrowRight className="lab-explainer-arrow" size={18} /></motion.div></AnimatePresence>
        </div>
      </div>
    </section>
  );
}
