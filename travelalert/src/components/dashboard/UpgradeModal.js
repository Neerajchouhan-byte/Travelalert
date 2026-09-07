"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, LoaderCircle, ShieldCheck } from "lucide-react";
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

async function authHeaders() {
  const { data } = await supabase?.auth.getSession();
  return data?.session?.access_token
    ? { Authorization: `Bearer ${data.session.access_token}` }
    : null;
}

export function UpgradeModal({ isOpen, onClose, city = "" }) {
  const [busyPlan, setBusyPlan] = useState("");
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let current = true;

    (async () => {
      const headers = await authHeaders();
      if (!headers) return;
      try {
        const response = await fetch("/api/billing/subscription", { headers });
        const body = await response.json().catch(() => ({}));
        if (current && response.ok) setSubscription(body.subscription);
      } catch {
        // Ignore errors
      }
    })();

    return () => {
      current = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  async function startCheckout(plan) {
    setError("");
    setBusyPlan(plan);

    try {
      if (!supabase) throw new Error("Authentication is not configured.");
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.access_token) {
        throw new Error("Please sign in to upgrade.");
      }

      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({
          plan,
          city: city || undefined,
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || "Could not start checkout. Please try again.");
      }

      if (body.url) {
        window.location.href = body.url;
      } else {
        throw new Error("No checkout URL returned.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setBusyPlan("");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="relative z-10 mx-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0c] shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 rounded-full p-2 text-[#68686f] transition-colors hover:bg-white/[0.08] hover:text-[#f3f3f2]"
              aria-label="Close upgrade modal"
            >
              <X className="size-5" />
            </button>
            <div className="border-b border-white/10 px-6 py-6 text-center sm:px-8">
              <h2 className="text-xl font-bold text-[#f3f3f2] sm:text-2xl">
                Upgrade your access
              </h2>
              <p className="mt-2 text-sm text-[#a6a6ad]">
                Get unlimited access to travel safety intelligence worldwide
              </p>
            </div>
            {error && (
              <div className="mx-6 mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 sm:mx-8">
                {error}
              </div>
            )}
            <div className="grid gap-4 p-6 sm:grid-cols-3 sm:gap-5 sm:p-8">
              {plans.map((plan) => (
                <motion.div
                  key={plan.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: plan.featured ? 0.1 : 0.2 }}
                  className={`flex flex-col rounded-xl border p-5 ${
                    plan.featured
                      ? "border-[#f3f3f2]/30 bg-white/[0.04]"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  {plan.featured && (
                    <span className="mb-3 w-fit rounded-full bg-[#f3f3f2] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#111]">
                      Most popular
                    </span>
                  )}
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#68686f]">
                    {plan.key === "destination_pack"
                      ? "Destination coverage"
                      : plan.key === "annual"
                        ? "Full access"
                        : "Trip coverage"}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-[#f3f3f2]">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-mono text-2xl font-bold text-[#f3f3f2] sm:text-3xl">
                      {plan.price}
                    </span>
                    <span className="text-sm text-[#68686f]">{plan.period}</span>
                  </div>
                  {plan.key === "destination_pack" && city && (
                    <div className="mt-3 rounded-lg border border-white/10 bg-[#101013] px-3 py-2 font-mono text-[10px] text-[#a6a6ad]">
                      Destination:{" "}
                      <span className="font-semibold text-[#f3f3f2]">{city}</span>
                    </div>
                  )}
                  <p className="mt-3 text-sm leading-5 text-[#a6a6ad]">{plan.description}</p>
                  <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-[#a6a6ad]">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-[#3ecf8e]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => startCheckout(plan.key)}
                    disabled={Boolean(busyPlan)}
                    className={`mt-6 flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      plan.featured
                        ? "bg-[#f3f3f2] text-[#111] hover:bg-white"
                        : "border border-white/15 bg-white/[0.04] text-[#f3f3f2] hover:border-white/25 hover:bg-white/[0.08]"
                    }`}
                  >
                    {busyPlan === plan.key && (
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                    )}
                    {plan.action}
                  </button>
                  {plan.key === "annual" && subscription?.plan === "annual" && (
                    <p className="mt-3 text-center font-mono text-[10px] text-[#68686f]">
                      Your Annual plan is active.
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 pb-6 text-center text-xs text-[#a6a6ad]">
              <ShieldCheck className="size-4 text-emerald-400" />
              Secure checkout and access confirmation by Dodo Payments.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
