"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
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
  const [user, setUser] = useState(null);

  // Check authentication status
  useEffect(() => {
    if (!supabase) return;
    
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        const next = city ? `/login?city=${encodeURIComponent(city)}` : "/login";
        router.replace(next);
        return;
      }
      setUser(data.session.user);
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        const next = city ? `/login?city=${encodeURIComponent(city)}` : "/login";
        router.replace(next);
      }
      setUser(session?.user ?? null);
    });

    return () => authSub?.unsubscribe();
  }, [router, city]);

  // Fetch subscription data
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

  // Show loading state while checking auth
  if (!user) {
    return (
      <main className="min-h-svh bg-[#0a0a0c] text-[#f3f3f2]">
        <div className="flex min-h-svh items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto size-8 animate-spin text-[#5b9dee]" />
            <p className="mt-4 text-sm text-[#a6a6ad]">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-[#0a0a0c] text-[#f3f3f2]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0c]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-bold tracking-tight transition-opacity hover:opacity-80">
            TravelRadar
          </Link>
          <Link
            href="/profile"
            aria-label="Open profile"
            className="flex size-8 items-center justify-center rounded-full border border-[#e5484a]/40 bg-[#e5484a]/15 text-[#e5484a] transition-colors hover:bg-[#e5484a]/25"
          >
            <UserRound className="size-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Back Link */}
        <Link
          href={city ? `/dashboard?city=${encodeURIComponent(city)}` : "/dashboard"}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#a6a6ad] transition hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Back to dashboard
        </Link>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 text-center"
        >
          <span className="inline-block rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#a6a6ad]">
            Flexible access
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Choose coverage that fits your journey.
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#a6a6ad] sm:text-base">
            {city ? (
              <>
                You are viewing <span className="font-semibold text-white">{city}</span>. Choose the access level for your trip.
              </>
            ) : (
              "Choose the access level that fits your trip."
            )}
          </p>
          {city && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 font-mono text-[10px] text-[#a6a6ad]">
              <MapPin className="size-3.5 text-[#f0a63d]" />
              {city}
              <span className="text-[#68686f]">·</span>
              From {source}
            </div>
          )}
        </motion.div>

        {/* Info Banner */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center sm:mt-8">
          <p className="text-sm text-[#a6a6ad]">
            One-off options never renew. Annual access is billed once per year—there is no monthly plan.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Pricing Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.45 }}
              className={`relative flex flex-col rounded-2xl border p-5 sm:p-6 ${
                plan.featured
                  ? "border-[#e5484a]/50 bg-gradient-to-b from-[rgba(229,72,74,0.15)] to-transparent"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-6 rounded-full bg-[#e5484a] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
                  Best value
                </span>
              )}
              
              <div className="flex-1">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#68686f]">
                  {plan.key === "destination_pack"
                    ? "Destination coverage"
                    : plan.key === "annual"
                      ? "Full access"
                      : "Trip coverage"}
                </p>
                <h2 className="mt-2 text-lg font-bold text-[#f3f3f2] sm:text-xl">{plan.name}</h2>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold text-[#f3f3f2] sm:text-4xl">{plan.price}</span>
                  <span className="text-sm text-[#68686f]">{plan.period}</span>
                </div>
                {plan.key === "destination_pack" && (
                  <div className="mt-3 rounded-lg border border-white/10 bg-[#101013] px-3 py-2 font-mono text-[10px] text-[#a6a6ad]">
                    Destination: <span className="font-semibold text-[#f3f3f2]">{city || "Choose from a dashboard"}</span>
                  </div>
                )}
                <p className="mt-3 text-sm leading-5 text-[#a6a6ad]">{plan.description}</p>
                <ul className="mt-4 space-y-2.5 border-t border-white/10 pt-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#a6a6ad]">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-[#3ecf8e]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
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
                {busyPlan === plan.key && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                {plan.action}
              </button>
              
              {plan.key === "annual" && subscription?.plan === "annual" && (
                <p className="mt-3 text-center font-mono text-[10px] text-[#68686f]">Your Annual plan is active.</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 pb-8 text-center text-xs text-[#a6a6ad] sm:mt-10">
          <ShieldCheck className="size-4 text-emerald-400" />
          Secure checkout and access confirmation by Dodo Payments.
        </div>
      </div>
    </main>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <main className="min-h-svh bg-[#0a0a0c] text-[#f3f3f2]">
        <div className="flex min-h-svh items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto size-8 animate-spin text-[#5b9dee]" />
            <p className="mt-4 text-sm text-[#a6a6ad]">Loading upgrade options...</p>
          </div>
        </div>
      </main>
    }>
      <UpgradeContent />
    </Suspense>
  );
}
