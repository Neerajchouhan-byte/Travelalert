"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { checkoutUrl } from "@/lib/checkout";

export default function Pricing() {
  const [proHref, setProHref] = useState(
    process.env.NEXT_PUBLIC_CHECKOUT_PRO || "/login"
  );
  const [lifeHref, setLifeHref] = useState(
    process.env.NEXT_PUBLIC_CHECKOUT_LIFE || "/login"
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
          style={{ marginLeft: "auto", marginRight: "auto", textAlign: "center" }}
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
          <div className="p-card reveal" style={{ "--i": 0 }}>
            <span className="p-name">Explorer</span>
            <div className="p-price">
              <span className="amt">$0</span>
              <span className="per">/month</span>
            </div>
            <p className="p-desc">Try it before your next trip. No card required.</p>
            <ul className="p-feats">
              <li>
                <i className="fa-solid fa-check"></i>3 destination searches / month
              </li>
              <li>
                <i className="fa-solid fa-check"></i>2 scam alerts per destination
              </li>
              <li>
                <i className="fa-solid fa-check"></i>Basic food and transport tips
              </li>
              <li className="locked">
                <i className="fa-solid fa-xmark"></i>Full alerts library
              </li>
              <li className="locked">
                <i className="fa-solid fa-xmark"></i>Offline access
              </li>
            </ul>
            <a href="/login" className="btn-ghost btn-block">
              Start exploring
            </a>
          </div>

          <div className="p-card pop reveal" style={{ "--i": 1 }}>
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
              <li>
                <i className="fa-solid fa-check"></i>Unlimited destinations
              </li>
              <li>
                <i className="fa-solid fa-check"></i>All scam alerts, updated daily
              </li>
              <li>
                <i className="fa-solid fa-check"></i>Full tips library, every category
              </li>
              <li>
                <i className="fa-solid fa-check"></i>Offline destination guides
              </li>
              <li>
                <i className="fa-solid fa-check"></i>Pre-trip email 3 days out
              </li>
            </ul>
            <a
              href={proHref}
              className="btn-primary btn-block"
              style={{ justifyContent: "center", padding: "0.85rem 1.5rem" }}
            >
              <span>Upgrade to Pro</span>
            </a>
            <p className="p-note">$9/month · cancel anytime</p>
          </div>

          <div className="p-card reveal" style={{ "--i": 2 }}>
            <span className="p-name">Traveler Ultimate</span>
            <div className="p-price">
              <span className="amt">$79</span>
              <span className="per">/once</span>
            </div>
            <p className="p-desc">
              Pay once. Lifetime access to every current and future feature.
            </p>
            <ul className="p-feats">
              <li>
                <i className="fa-solid fa-check"></i>Everything in Traveler Pro
              </li>
              <li>
                <i className="fa-solid fa-check"></i>Lifetime access
              </li>
              <li>
                <i className="fa-solid fa-check"></i>Priority support
              </li>
              <li>
                <i className="fa-solid fa-check"></i>Monthly intelligence reports
              </li>
            </ul>
            <a href={lifeHref} className="btn-ghost btn-block">
              Pay once, travel forever
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}