"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, LoaderCircle, ShieldCheck, X } from "lucide-react";
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
    features: ["Lifetime access to one destination", "Start from a destination dashboard", "No subscription or renewal"],
    action: "Choose a destination",
  },
];

export default function UpgradeModal({ isOpen, onClose, city = "" }) {
  const [busyPlan, setBusyPlan] = useState("");
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    let current = true;

    async function loadSubscription() {
      const { data } = await supabase?.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) return;
      try {
        const response = await fetch("/api/billing/subscription", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await response.json().catch(() => ({}));
        if (current && response.ok) setSubscription(body.subscription);
      } catch {
        // Subscription status is optional for checkout.
      }
    }

    loadSubscription();
    return () => { current = false; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  async function checkout(plan) {
    setError("");
    const { data } = await supabase?.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) {
      setError("Please sign in to upgrade.");
      return;
    }

    setBusyPlan(plan);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ plan, destination: city }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.checkoutUrl) throw new Error(body.error || "Checkout could not be started.");
      window.location.assign(body.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout could not be started.");
      setBusyPlan("");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="upgrade-modal-title">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="relative z-10 max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0c] p-5 shadow-2xl sm:p-8"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="absolute right-4 top-4 z-10 rounded-full p-2 text-[#a6a6ad] hover:bg-white/10 hover:text-white" onClick={onClose} aria-label="Close upgrade modal">
              <X className="size-5" />
            </button>
            <div className="sec-head" style={{ marginInline: "auto", paddingRight: "2rem", textAlign: "center" }}>
              <span className="eyebrow">Flexible access</span>
              <h2 id="upgrade-modal-title">Choose coverage that fits your journey.</h2>
            </div>
            <div className="price-anchor">One-off options never renew. Annual access is billed once per year—there is no monthly plan.</div>
            {error && <p role="alert" className="price-anchor" style={{ borderColor: "rgba(229,72,74,.55)", color: "#fecaca" }}>{error}</p>}
            <div className="pricing-grid">
              {plans.map((plan, index) => (
                <motion.div key={plan.key} className={`p-card ${plan.featured ? "pop" : ""}`} style={{ "--i": index }} whileHover={{ y: -6 }}>
                  {plan.featured && <span className="pop-badge">Best value</span>}
                  <span className="p-name">{plan.name}</span>
                  <div className="p-price"><span className="amt">{plan.price}</span><span className="per">{plan.period}</span></div>
                  <p className="p-desc">{plan.description}</p>
                  <ul className="p-feats">{plan.features.map((feature) => <li key={feature}><Check className="size-3.5 shrink-0" aria-hidden="true" />{feature}</li>)}</ul>
                  <button type="button" className={plan.featured ? "btn-primary btn-block" : "btn-ghost btn-block"} onClick={() => checkout(plan.key)} disabled={Boolean(busyPlan)} aria-busy={busyPlan === plan.key} style={plan.featured ? { justifyContent: "center", padding: "0.85rem 1.5rem" } : undefined}>
                    {busyPlan === plan.key && <LoaderCircle className="mr-2 size-4 animate-spin" />}{plan.action}
                  </button>
                  {plan.key === "annual" && subscription?.plan === "annual" && <p className="p-note">Your Annual plan is active.</p>}
                </motion.div>
              ))}
            </div>
            <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-[#a6a6ad]"><ShieldCheck className="size-4 text-emerald-400" aria-hidden="true" />Secure checkout and access confirmation by Dodo Payments.</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}