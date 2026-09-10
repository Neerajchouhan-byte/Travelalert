"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import { supabase } from "@/lib/supabase";


const BENEFITS = [
  "Every alert in the destination file",
  "Every insider tip, refreshed daily",
  "Weather, currency and money advice",
  "Every city — no free-tier limit",
];

export default function UpgradeModal({ isOpen, onClose, city = "" }) {
  const [selected, setSelected] = useState("annual");
  const [busyPlan, setBusyPlan] = useState("");
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState(null);
  const PLANS = [
    { key: "trip_pass", name: "Trip Pass", price: "$7", period: "/ 30 days",
      note: "Pay once · 30 days access", badge: null },
    { key: "annual", name: "Vacation", price: "$29", period: "/ year",
      note: "Billed once a year · Unlimited", badge: "BEST VALUE" },
    { key: "destination_pack", name: "This City Only", price: "$19", period: "/ forever",
      note: city ? `Lifetime access to ${city}` : "Lifetime access to one city",
      badge: null },
  ];
  // ...rest unchanged

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
    return () => {
      current = false;
    };
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
     setError("");
  if (plan === "destination_pack" && !city) {
    onClose();
    window.location.assign("/dashboard?upgrade=true");
    return;
  }

    setBusyPlan(plan);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan, destination: city }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.checkoutUrl)
        throw new Error(body.error || "Checkout could not be started.");
      window.location.assign(body.checkoutUrl);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout could not be started."
      );
      setBusyPlan("");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-colors dark:bg-black/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-[32px] border border-zinc-200/80 bg-white p-6 shadow-2xl transition-colors sm:p-8 dark:border-white/10 dark:bg-[#141418] dark:shadow-black/80"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Top row: Badges on left, solid circular close button on right */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-[#fef3c7] text-[#d97706] dark:bg-[#332210] dark:text-[#fbbf24]">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex items-center gap-1 rounded-full bg-[#fef3c7] px-2.5 py-1 font-mono text-[11px] font-black uppercase tracking-wider text-[#d97706] dark:bg-[#332210] dark:text-[#fbbf24]">
                  <span>PRO</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close upgrade modal"
                className="flex size-8 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-80 dark:bg-[#202028] dark:text-white dark:hover:bg-[#2a2a34]"
              >
                <X className="size-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Title & Description */}
            <h2
              id="upgrade-modal-title"
              className="mt-5 text-2xl font-black tracking-tight text-zinc-900 sm:text-[26px] dark:text-white"
            >
              Every alert, every tip, every city.
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500 sm:text-[13px] dark:text-zinc-400">
              Free covers the three highest-signal items. Pro opens the full
              local intelligence file, refreshed daily.
            </p>

            {/* Benefits Checklist */}
            <ul className="mt-5 space-y-2.5">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-2.5 text-xs font-medium text-zinc-700 sm:text-sm dark:text-zinc-200"
                >
                  <Check className="size-4 shrink-0 stroke-[2.5] text-[#10b981]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {/* Plan selection cards (2-column side by side) */}
            <div
              className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
              role="group"
              aria-label="Choose a plan"
            >
              {PLANS.map((plan) => {
                const isSelected = selected === plan.key;
                return (
                  <button
                    key={plan.key}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelected(plan.key)}
                    className={`relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all ${
                      isSelected
                        ? "border-2 border-red-400/90 bg-white shadow-xs dark:border-red-500/80 dark:bg-[#191920]"
                        : "border border-zinc-200/90 bg-white hover:border-zinc-300 dark:border-white/10 dark:bg-[#16161b] dark:hover:border-white/20"
                    }`}
                  >
                    <div>
                      {/* Radio & Title row */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex size-3.5 shrink-0 items-center justify-center rounded-full transition-all ${
                              isSelected
                                ? "border-2 border-[#e5283b]"
                                : "border border-zinc-300 dark:border-zinc-600"
                            }`}
                          >
                            {isSelected && (
                              <span className="size-1.5 rounded-full bg-[#e5283b]" />
                            )}
                          </span>
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">
                            {plan.name}
                          </span>
                        </div>

                        {plan.badge && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-amber-800 dark:bg-amber-950/70 dark:text-amber-400">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <p className="mt-2.5 font-mono text-base font-black text-zinc-900 sm:text-lg dark:text-white">
                        {plan.price}{" "}
                        <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                          {plan.period}
                        </span>
                      </p>
                    </div>

                    {/* Subtitle note */}
                    <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                      {plan.note}
                    </p>
                  </button>
                );
              })}
            </div>

            {error && (
              <p
                role="alert"
                className="mt-3 text-center text-xs font-semibold text-red-600 dark:text-red-400"
              >
                {error}
              </p>
            )}

            {subscription?.plan === "annual" && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="size-3.5" /> Your Annual plan is active.
              </p>
            )}

            {/* Primary CTA button */}
            <button
              type="button"
              disabled={Boolean(busyPlan)}
              aria-busy={busyPlan === activePlan.key}
              onClick={() => checkout(activePlan.key)}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold text-white shadow-md transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-60 dark:border dark:border-white/20 dark:bg-black dark:hover:bg-zinc-900"
            >
              {busyPlan === activePlan.key ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                `Unlock Pro — ${activePlan.price}`
              )}
            </button>

            {/* Footer */}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-zinc-400 dark:text-zinc-500">
              <ShieldCheck className="size-4 text-zinc-400 dark:text-zinc-500" />
              <span>Secure checkout and access confirmation by Dodo Payments.</span>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}