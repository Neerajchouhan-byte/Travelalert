"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { checkoutUrl } from "@/lib/checkout";

function Feat({ children, locked = false }) {
  return (
    <li className={locked ? "locked" : undefined}>
      {locked ? (
        <X className="size-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <Check className="size-3.5 shrink-0" aria-hidden="true" />
      )}
      {children}
    </li>
  );
}

export default function Pricing() {
  const [proHref, setProHref] = useState(
    process.env.NEXT_PUBLIC_CHECKOUT_PRO || "/login",
  );
  const [lifeHref, setLifeHref] = useState(
    process.env.NEXT_PUBLIC_CHECKOUT_LIFE || "/login",
  );

  useEffect(() => {
    let on = true;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!on || !user) return;
      setProHref(checkoutUrl("pro", user.id, user.email));
      setLifeHref(checkoutUrl("lifetime", user.id, user.email));
    })();
    return () => {
      on = false;
    };
  }, []);

  return (
    <section id="pricing">
      <div className="container">
        <div
          className="sec-head reveal"
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center",
          }}
        >
          <span className="eyebrow">Simple pricing</span>
          <h2>Less than one coffee.</h2>
        </div>
        <div className="price-anchor reveal">
          Scams in Southeast Asia average <b>$180</b>. TravelRadar Pro costs{" "}
          <span className="good">$9/month</span>. One prevented scam pays for 20
          months.
        </div>
        <div className="pricing-grid">
          <motion.div
            className="p-card reveal"
            style={{ "--i": 0 }}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <span className="p-name">Explorer</span>
            <div className="p-price">
              <span className="amt">$0</span>
              <span className="per">/month</span>
            </div>
            <p className="p-desc">
              Try it before your next trip. No card required.
            </p>
            <ul className="p-feats">
              <Feat>3 destination searches / month</Feat>
              <Feat>2 scam alerts + 3 tips per city</Feat>
              <Feat locked>Full alert library</Feat>
            </ul>
            <a href="/login" className="btn-ghost btn-block">
              Start exploring
            </a>
          </motion.div>

          <motion.div
            className="p-card pop reveal"
            style={{ "--i": 1 }}
            whileHover={{ y: -8, scale: 1.015 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
          >
            <span className="pop-badge">Most popular</span>
            <span className="p-name">Traveler Pro</span>
            <div className="p-price">
              <span className="amt">$9</span>
              <span className="per">/month</span>
            </div>
            <p className="p-desc">
              Less than one street food meal. Protects the whole trip.
            </p>
            <ul className="p-feats">
              <Feat>Unlimited destinations</Feat>
              <Feat>All scam alerts, refreshed daily</Feat>
              <Feat>Full tips library</Feat>
              <Feat>Live weather and currency for the city</Feat>
            </ul>
            <a
              href={proHref}
              className="btn-primary btn-block"
              style={{ justifyContent: "center", padding: "0.85rem 1.5rem" }}
            >
              <span>Upgrade to Pro</span>
            </a>
            <p className="p-note">$9/month · cancel anytime</p>
          </motion.div>

          <motion.div
            className="p-card reveal"
            style={{ "--i": 2 }}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <span className="p-name">Traveler Ultimate</span>
            <div className="p-price">
              <span className="amt">$79</span>
              <span className="per">/once</span>
            </div>
            <p className="p-desc">
              Pay once. Lifetime access to every current and future feature.
            </p>
            <ul className="p-feats">
              <Feat>Everything in Traveler Pro</Feat>
              <Feat>Lifetime access</Feat>
              <Feat>Priority support</Feat>
              <Feat>Monthly intelligence reports</Feat>
            </ul>
            <a href={lifeHref} className="btn-ghost btn-block">
              Pay once, travel forever
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}