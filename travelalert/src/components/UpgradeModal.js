"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const PLANS = [
  {
    key: "trip_pass",
    name: "Monthly",
    price: "$7",
    period: "/mo",
    note: "Pay once · 30 days",
    badge: null,
  },
  {
    key: "annual",
    name: "Yearly",
    price: "$29",
    period: "/yr",
    note: "Billed once a year",
    badge: "SAVE 52%",
  },
];

const BENEFITS = [
  "Every alert in the destination file",
  "Every insider tip, refreshed daily",
  "Weather, currency and money advice",
  "Every city — no per-search limits",
];

export default function UpgradeModal({ isOpen, onClose, city = "" }) {
  const [selected, setSelected] = useState("annual");
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

  const activePlan = PLANS.find((p) => p.key === selected) || PLANS[1];

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
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-modal-title"
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0c] p-5 shadow-2xl sm:p-6"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 rounded-full p-2 text-[#a6a6ad] hover:bg-white/10 hover:text-white"
              onClick={onClose}
              aria-label="Close upgrade modal"
            >
              <X className="size-5" />
            </button>

            {/* Brand mark + Pro badge */}
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#f0a63d]/30 bg-[#1c1c21]">
                <Sparkles className="size-5 text-[#f0a63d]" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#f0a63d]/40 bg-[rgba(240,166,61,0.14)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f0a63d]">
                <Sparkles className="size-3" aria-hidden="true" />
                Pro
              </span>
            </div>

            {/* Copy */}
            <h2 id="upgrade-modal-title" className="mt-3 text-xl font-bold tracking-tight text-[#f3f3f2]">
              Every alert, every tip, every city.
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#a6a6ad]">
              Free covers the three highest-signal items. Pro opens the full
              local intelligence file, refreshed daily.
            </p>
            {/* Benefits */}
            <ul className="mt-3 space-y-1.5">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-xs text-[#a6a6ad]">
                  <Check className="size-3.5 shrink-0 text-[#3ecf8e]" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* Plan selectors */}
            <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Choose a plan">
              {PLANS.map((plan) => {
                const on = selected === plan.key;
                return (
                  <button
                    key={plan.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelected(plan.key)}
                    className={`relative flex min-h-[4.5rem] flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-colors duration-200 ${
                      on
                        ? "border-[#f0a63d]/60 bg-[rgba(240,166,61,0.12)]"
                        : "border-white/10 bg-[#141418] hover:border-white/20"
                    }`}
                  >
                    <span className="flex w-full items-center justify-between">
                      <span className={`text-xs font-semibold ${on ? "text-[#f3f3f2]" : "text-[#a6a6ad]"}`}>
                        {plan.name}
                      </span>
                      {plan.badge && (
                        <span className="rounded-full bg-[rgba(240,166,61,0.16)] px-1.5 font-mono text-[9px] text-[#f0a63d]">
                          {plan.badge}
                        </span>
                      )}
                    </span>
                    <span className={`mt-0.5 font-mono text-lg font-bold ${on ? "text-[#f3f3f2]" : "text-[#a6a6ad]"}`}>
                      {plan.price}
                      <span className="ml-0.5 text-[10px] text-[#68686f]">{plan.period}</span>
                    </span>
                    <span className="mt-0.5 text-[10px] text-[#68686f]">{plan.note}</span>
                    <span
                      aria-hidden="true"
                      className={`absolute end-2.5 top-2 size-3 rounded-full border ${
                        on ? "border-[#f0a63d] bg-[#f0a63d]/25" : "border-white/20 bg-transparent"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {error && (
              <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-[#f87b7b]">
                {error}
              </p>
            )}
            {subscription?.plan === "annual" && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#3ecf8e]">
                <Check className="size-3.5" /> Your Annual plan is active.
              </p>
            )}

            {/* CTA */}
            <button
              type="button"
              disabled={Boolean(busyPlan)}
              aria-busy={busyPlan === activePlan.key}
              onClick={() => checkout(activePlan.key)}
              className="mt-4 flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f0a63d] text-sm font-bold text-[#2b1a06] transition-transform active:scale-[0.98]"
            >
              {busyPlan === activePlan.key && <LoaderCircle className="size-4 animate-spin" />}
              Unlock Pro — {activePlan.price}
            </button>

            <p className="mt-3 flex items-center justify-center gap-2 text-center text-[10px] text-[#68686f]">
              <ShieldCheck className="size-3.5 text-[#3ecf8e]" aria-hidden="true" />
              Secure checkout and access confirmation by Dodo Payments.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}