"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Cta() {
  return (
    <section className="cta-section">
      <div className="container">
        <motion.div
          className="cta-panel"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="eyebrow">
            <span className="live-dot" />
            12 SCAMS REPORTED IN THE LAST 24 HOURS
          </span>
          <h2 className="cta-h2">
            Don't be the tourist{" "}
            <span className="grad-accent">who finds out after.</span>
          </h2>
          <p className="cta-sub">
            Takes 30 seconds. Could save you $180 on day one.
          </p>
          <a
            href="#hero"
            className="btn-primary"
            style={{
              padding: "0.85rem 0.5rem 0.85rem 1.8rem",
              fontSize: "1rem",
            }}
          >
            <span>Scan now</span>
            <span
              className="icw"
              style={{ width: "2.4rem", height: "2.4rem" }}
            >
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
          </a>
          <div className="cta-note">
            <span className="live-dot" />
            Smart travelers check before they fly.
          </div>
        </motion.div>
      </div>
    </section>
  );
}