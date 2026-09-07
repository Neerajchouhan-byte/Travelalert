"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, LoaderCircle, MapPin, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const plans = [
  {
    key: "trip_pass",
    name: "Per-trip Pass",
    price: "$7",
    period: "/ 30 days",
    description: "Full travel intelligence for one trip, with access lasting 30 days from payment.",
    features: ["Unlimited destinations for 30 days", "All alerts and insider tips", "No renewal or cancellation needed"],
    action: "Get 30-day access",
  },
  {
    key: "annual",
    name: "Annual",
    price: "$29",
    period: "/ year",
    description: "Year-round access to every destination, billed once per year.",
    features: ["Unlimited destinations all year", "All alerts, tips, weather, and currency", "Manage or cancel renewal anytime"],
    action: "Choose Annual",
    featured: true,
  },
  {
    key: "destination_pack",
    name: "Destination Pack",
    price: "$19",
    period: "/ destination",
    description: "Permanent access to the full briefing for one destination you choose.",
    features: ["Lifetime access to one destination", "Choose your destination at checkout", "No subscription or renewal"],
    action: "Unlock this destination",
  },
];

async function authHeaders() {
  const { data } = await supabase?.auth.getSession();
  return data?.session?.access_token
    ? { Authorization: `Bearer ${data.session.access_token}` }
    : null;
}

export default function Pricing() {
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [destination, setDestination] = useState("");
  const [busyPlan, setBusyPlan] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let current = true;
    (async () => {
      const headers = await authHeaders();
      if (!headers) return;
      const response = await fetch("/api/billing/subscription", { headers });
      const body = await response.json().catch(() => ({}));
      if (current && response.ok) setSubscription(body.subscription);
    })();
    return () => { current = false; };
  }, []);

  async function checkout(plan) {
    setError("");
    const headers = await authHeaders();
    if (!headers) return router.push("/login");
    if (plan === "destination_pack" && destination.trim().length < 2) {
      setError("Enter the destination you want to unlock permanently.");
      return;
    }
    setBusyPlan(plan);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ plan, destination }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.checkoutUrl) throw new Error(body.error || "Checkout could not be started.");
      window.location.assign(body.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout could not be started.");
    } finally {
      setBusyPlan("");
    }
  }

  return (
    <section id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <div className="sec-head reveal" style={{ marginInline: "auto", textAlign: "center" }}>
          <span className="eyebrow">Flexible access</span>
          <h2 id="pricing-title">Choose coverage that fits your journey.</h2>
        </div>
        <div className="price-anchor reveal">
          One-off options never renew. Annual access is billed once per year—there is no monthly plan.
        </div>
        {error && <p role="alert" className="price-anchor" style={{ borderColor: "rgba(229,72,74,.55)", color: "#fecaca" }}>{error}</p>}
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <motion.div key={plan.key} className={`p-card reveal ${plan.featured ? "pop" : ""}`} style={{ "--i": index }} whileHover={{ y: -6 }}>
              {plan.featured && <span className="pop-badge">Best value</span>}
              <span className="p-name">{plan.name}</span>
              <div className="p-price"><span className="amt">{plan.price}</span><span className="per">{plan.period}</span></div>
              <p className="p-desc">{plan.description}</p>
              <ul className="p-feats">{plan.features.map((feature) => <li key={feature}><Check className="size-3.5 shrink-0" aria-hidden="true" />{feature}</li>)}</ul>
              {plan.key === "destination_pack" && (
                <label className="mb-3 block text-left text-xs text-[#a6a6ad]">
                  <span className="mb-1 flex items-center gap-1"><MapPin className="size-3" />Destination</span>
                  <input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="e.g. Bangkok" className="w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-[#5b9dee]" />
                </label>
              )}
              <button type="button" className={plan.featured ? "btn-primary btn-block" : "btn-ghost btn-block"} onClick={() => checkout(plan.key)} disabled={Boolean(busyPlan)} aria-busy={busyPlan === plan.key} style={plan.featured ? { justifyContent: "center", padding: "0.85rem 1.5rem" } : undefined}>
                {busyPlan === plan.key && <LoaderCircle className="mr-2 size-4 animate-spin" />}{plan.action}
              </button>
              {plan.key === "annual" && subscription?.plan === "annual" && <p className="p-note">Your Annual plan is active.</p>}
            </motion.div>
          ))}
        </div>
        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-[#a6a6ad]"><ShieldCheck className="size-4 text-emerald-400" aria-hidden="true" />Secure checkout and access confirmation by Dodo Payments.</p>
      </div>
    </section>
  );
}