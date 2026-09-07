"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle, MapPin, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
import { Topbar } from "@/components/dashboard/Topbar";
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

function UpgradeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "";
  const source = searchParams.get("source") || "dashboard";
  const [busyPlan, setBusyPlan] = useState("");
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState(null);

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

  async function startCheckout(plan) {
    setError("");
    setBusyPlan(plan);

    try {
      if (!supabase) throw new Error("Authentication is not configured.");
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) {
        router.replace(`/login?city=${encodeURIComponent(city)}`);
        return;
      }

      const body = { plan };
      if (plan === "destination_pack") {
        if (city.trim().length < 2) {
          throw new Error("Open Upgrade from a destination dashboard to use Destination Pack.");
        }
        body.destination = city;
      }

      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error || "Unable to start Dodo checkout.");
      }
      window.location.assign(result.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout.");
      setBusyPlan("");
    }
  }

  return (
    <main className="min-h-svh bg-[#0a0a0c] text-[#f3f3f2]">
      <Topbar city={city || "your destination"} />

      <div className="mx-auto w-full max-w-6xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8">
        <Link
          href={city ? `/dashboard?city=${encodeURIComponent(city)}` : "/dashboard"}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#a6a6ad] transition hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Back to dashboard
        </Link>

        {/* Header Section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#a6a6ad]">
            Flexible access
          </span>
          <h1 className="mt-3 text-xl font-bold tracking-tight sm:mt-4 sm:text-2xl lg:text-3xl">
            Choose coverage that fits your journey.
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-[#a6a6ad] sm:mt-3 sm:text-sm sm:leading-6">
            {city ? (
              <>
                You are viewing <span className="font-semibold text-white">{city}</span>. Choose the access level for your trip.
              </>
            ) : (
              "Choose the access level that fits your trip."
            )}
          </p>
          {city && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] text-[#a6a6ad] sm:mt-4 sm:px-3.5 sm:py-2">
              <MapPin className="size-3 text-[#f0a63d] sm:size-3.5" />
              {city}
              <span className="text-[#68686f]">·</span>
              From {source}
            </div>
          )}
        </motion.section>

        {/* Info Banner */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center sm:p-4">
          <p className="text-xs text-[#a6a6ad] sm:text-sm">
            One-off options never renew. Annual access is billed once per year—there is no monthly plan.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 sm:px-4 sm:py-3 sm:text-sm">
            {error}
          </p>
        )}

        {/* Pricing Grid - Responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className={`relative rounded-xl border p-4 sm:rounded-2xl sm:p-6 ${
                plan.featured
                  ? "border-[#e5484a]/50 bg-[linear-gradient(160deg,rgba(229,72,74,0.15),transparent_60%)]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-[#e5484a] px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-white sm:-top-3 sm:px-3 sm:py-1 sm:text-[10px]">
                  Best value
                </span>
              )}
              <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-[#68686f] sm:text-[10px]">
                {plan.key === "destination_pack"
                  ? "Destination coverage"
                  : plan.key === "annual"
                    ? "Full access"
                    : "Trip coverage"}
              </p>
              <h2 className="mt-1.5 text-base font-bold text-[#f3f3f2] sm:mt-2 sm:text-lg">{plan.name}</h2>
              <div className="mt-2 flex items-baseline gap-1 sm:mt-3">
                <span className="font-mono text-2xl font-bold text-[#f3f3f2] sm:text-3xl">{plan.price}</span>
                <span className="text-xs text-[#68686f] sm:text-sm">{plan.period}</span>
              </div>
              {plan.key === "destination_pack" && (
                <div className="mt-2 rounded-lg border border-white/10 bg-[#101013] px-2.5 py-1.5 font-mono text-[9px] text-[#a6a6ad] sm:mt-3 sm:px-3 sm:py-2 sm:text-[10px]">
                  Destination: <span className="font-semibold text-[#f3f3f2]">{city || "Choose from a dashboard"}</span>
                </div>
              )}
              <p className="mt-2 text-xs leading-4 text-[#a6a6ad] sm:mt-3 sm:text-sm sm:leading-5">{plan.description}</p>
              <ul className="mt-3 flex-1 space-y-2 border-t border-white/10 pt-3 sm:mt-4 sm:space-y-2.5 sm:pt-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-1.5 text-xs text-[#a6a6ad] sm:gap-2 sm:text-sm">
                    <Check className="mt-0.5 size-3 shrink-0 text-[#3ecf8e] sm:size-3.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => startCheckout(plan.key)}
                disabled={Boolean(busyPlan)}
                className={`mt-4 flex h-9 w-full items-center justify-center rounded-lg text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:mt-5 sm:h-10 sm:text-sm ${
                  plan.featured
                    ? "bg-[#f3f3f2] text-[#111] hover:bg-white"
                    : "border border-white/15 bg-white/[0.04] text-[#f3f3f2] hover:border-white/25 hover:bg-white/[0.08]"
                }`}
              >
                {busyPlan === plan.key && <LoaderCircle className="mr-1.5 size-3 animate-spin sm:mr-2 sm:size-3.5" />}
                {plan.action}
              </button>
              {plan.key === "annual" && subscription?.plan === "annual" && (
                <p className="mt-2 text-center font-mono text-[9px] text-[#68686f] sm:mt-3 sm:text-[10px]">Your Annual plan is active.</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Security Badge */}
        <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[10px] text-[#a6a6ad] sm:gap-2 sm:pt-2 sm:text-xs">
          <ShieldCheck className="size-3.5 text-emerald-400 sm:size-4" />
          Secure checkout and access confirmation by Dodo Payments.
        </p>
      </div>
    </main>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-[#0a0a0c] p-8 text-[#a6a6ad]">Loading upgrade options...</div>}>
      <RequireAuth>
        <UpgradeContent />
      </RequireAuth>
    </Suspense>
  );
}
