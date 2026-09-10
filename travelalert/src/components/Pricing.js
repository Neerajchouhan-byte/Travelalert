"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const plans = [
  {
    key: "free",
    name: "Explorer",
    price: "Free",
    period: "",
    description: "Preview essential tourist traps before you land.",
    features: [
      "3 destination searches total",
      "Preview top 2 high-risk alerts",
      "Preview top 3 insider tips",
      "Standard community consensus",
      "No credit card required",
    ],
    action: "Start free",
  },
  {
    key: "trip_pass",
    name: "Trip Pass",
    price: "$7",
    period: "/ 30 days",
    description:
      "Full travel intelligence for one trip, with access lasting 30 days from payment.",
    features: [
      "Unlimited destinations for 30 days",
      "All alerts and insider tips",
      "No renewal or cancellation needed",
    ],
    action: "Get 30-day access",
  },
  {
    key: "annual",
    name: "Annual",
    price: "$29",
    period: "/ year",
    description: "Year-round access to every destination, billed once per year.",
    features: [
      "Unlimited destinations all year",
      "All alerts, tips, weather, and currency",
      "Manage or cancel renewal anytime",
    ],
    action: "Choose Annual",
    featured: true,
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
    return () => {
      current = false;
    };
  }, []);

  const currentPlan = subscription?.plan || "free";

  async function handleFreeClick() {
    const headers = await authHeaders();
    if (headers) {
      router.push("/dashboard");
    } else {
      router.push("/signup");
    }
  }

  async function checkout(plan) {
    setError("");
    const headers = await authHeaders();
    if (!headers) return router.push("/login");
    setBusyPlan(plan);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
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
    } finally {
      setBusyPlan("");
    }
  }

  return (
    <section id="pricing" className="py-20 sm:py-28 border-b border-zinc-200/80 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">

        <div className="reveal">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#e5283b]">
            FLEXIBLE ACCESS
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Choose coverage that fits your journey.
          </h2>
          <p className="mt-2 max-w-xl mx-auto text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
            Start free. Upgrade when you need the full intelligence file. Annual
            access is billed once per year — there is no monthly plan.
          </p>
        </div>

        {error && (
          <p className="mt-4 text-xs font-semibold text-red-500">{error}</p>
        )}

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 text-left">
          {plans.map((plan, index) => {
            const isCurrent = plan.key === currentPlan;
            const isFree = plan.key === "free";
            const busy = busyPlan === plan.key;

            return (
              <motion.div
                key={plan.key}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                style={{ "--i": index }}
                className={`reveal rounded-[28px] p-6 flex flex-col justify-between shadow-xs transition-shadow ${
                  plan.featured
                    ? "border-2 border-[#e5283b] bg-white shadow-xl dark:bg-gradient-to-b dark:from-[#241215] dark:to-[#141418]"
                    : "border border-zinc-200/90 bg-white dark:border-white/10 dark:bg-[#141418]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {plan.name}
                    </span>
                    {plan.featured && !isCurrent && (
                      <span className="rounded-full bg-[#e5283b] px-2.5 py-0.5 font-mono text-[9px] font-extrabold uppercase text-white">
                        Best value
                      </span>
                    )}
                    {isCurrent && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-[9px] font-extrabold uppercase text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-black text-zinc-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-zinc-500 leading-relaxed min-h-[36px] dark:text-zinc-400">
                    {plan.description}
                  </p>

                  <ul className="mt-6 space-y-2 border-t border-zinc-100 pt-4 dark:border-white/5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300"
                      >
                        <Check className="size-3.5 text-[#e5283b] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isFree ? (
                  isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="mt-8 flex h-11 w-full items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-bold text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-500"
                    >
                      You&apos;re on Explorer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFreeClick}
                      className="mt-8 flex h-11 w-full items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-bold text-zinc-800 transition hover:bg-zinc-200/70 active:scale-[0.98] dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      {plan.action}
                    </button>
                  )
                ) : isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="mt-8 flex h-11 w-full items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-bold text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-500"
                  >
                    Your current plan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => checkout(plan.key)}
                    disabled={Boolean(busyPlan)}
                    className={`mt-8 flex h-11 w-full items-center justify-center rounded-full text-xs font-bold transition active:scale-[0.98] ${
                      plan.featured
                        ? "bg-[#e5283b] text-white hover:bg-[#d32032]"
                        : "border border-zinc-200 bg-zinc-100 text-zinc-800 hover:bg-zinc-200/70 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    }`}
                  >
                    {busy && (
                      <LoaderCircle className="mr-2 size-3.5 animate-spin" />
                    )}
                    {plan.action}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>Secure checkout and access confirmation by Dodo Payments.</span>
        </p>

      </div>
    </section>
  );
}