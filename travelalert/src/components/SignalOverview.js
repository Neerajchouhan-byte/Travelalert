"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowUpRight, Radio, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const signalData = [
  { day: "Mon", reports: 34 },
  { day: "Tue", reports: 48 },
  { day: "Wed", reports: 42 },
  { day: "Thu", reports: 61 },
  { day: "Fri", reports: 55 },
  { day: "Sat", reports: 76 },
  { day: "Sun", reports: 68 },
];

const metrics = [
  { value: "2,400+", label: "patterns tracked", icon: Activity, tone: "red" },
  { value: "180+", label: "destinations", icon: Radio, tone: "blue" },
  { value: "98%", label: "worth the brief", icon: ShieldCheck, tone: "green" },
];

export default function SignalOverview() {
  return (
    <section className="signal-overview" aria-labelledby="signal-title">
      <div className="container">
        <div className="signal-layout">
          <div className="signal-copy reveal">
            <span className="eyebrow"><span className="live-dot" /> Intelligence feed</span>
            <h2 id="signal-title">A clearer read on <span className="grad-accent">what is changing.</span></h2>
            <p className="sec-sub">We watch the conversation around each destination, then turn scattered traveler reports into signals you can act on.</p>
            <div className="signal-metrics">
              {metrics.map(({ value, label, icon: Icon, tone }, index) => (
                <motion.div className={`signal-metric ${tone}`} key={label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
                  <Icon size={15} />
                  <strong>{value}</strong>
                  <span>{label}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div className="signal-chart-panel" initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="signal-chart-head"><div><span className="chart-kicker"><span className="live-dot" /> LIVE INDEX</span><strong>Traveler reports this week</strong></div><span className="chart-change"><ArrowUpRight size={14} /> 21.4%</span></div>
            <div className="signal-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={signalData} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
              <defs><linearGradient id="signalFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e5484a" stopOpacity={0.38} /><stop offset="100%" stopColor="#e5484a" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#68686f", fontSize: 10 }} dy={8} />
              <YAxis hide domain={[0, 90]} />
              <Tooltip cursor={{ stroke: "rgba(255,255,255,.16)" }} contentStyle={{ background: "#17171c", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, color: "#f3f3f2", fontSize: 11 }} labelStyle={{ color: "#a6a6ad" }} />
              <Area type="monotone" dataKey="reports" stroke="#e5484a" strokeWidth={2} fill="url(#signalFill)" />
            </AreaChart></ResponsiveContainer></div>
            <div className="chart-caption"><span>Aggregated from 2,400+ report patterns</span><span>Updated 12 min ago</span></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
