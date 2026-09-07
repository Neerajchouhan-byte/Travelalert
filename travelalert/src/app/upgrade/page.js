"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
import { Topbar } from "@/components/dashboard/Topbar";
import { Panel } from "@/components/dashboard/Panel";
import { supabase } from "@/lib/supabase";

const plans = [
  {
    key: "trip_pass",
    name: "Per-trip Pass",
    price: "$7",
    period: "/ 30 days",
    description: "Full access for your current trip.",
    features: ["All destinations for 30 days", "All alerts and insider tips", "No renewal"],
  },
  {
    key: "annual",
    name: "Annual",
    price: "$29",
    period: "/ year",
    description: "Full access to every destination all year.",
    features: ["Unlimited destinations", "All alerts and insider tips", "Weather and currency intelligence"],
    featured: true,
  },
  {
    key: "destination_pack",
    name: "Destination Pack",
    price: "$19",
    period: "one time",
    description: "Permanent access to the destination you are viewing.",
    features: ["Permanent access to this destination", "All alerts and insider tips", "No renewal"],
  },
];

function UpgradeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "";
  const source = searchParams.get("source") || "dashboard";
  const [busyPlan, setBusyPlan] = useState("");
  const [error, setError] = useState("");

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

      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 sm:p-6 lg:p-8">
        <Link
          href={city ? `/dashboard?city=${encodeURIComponent(city)}` : "/dashboard"}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#a6a6ad] transition hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Back to dashboard
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#141418] px-5 py-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] sm:px-8 sm:py-9"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#5b9dee]/10 blur-3xl" />
          <div className="relative mx-auto max-w-2xl text-center">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5b9dee]">Upgrade access</p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Unlock the full briefing.</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#a6a6ad]">
              {city ? <>You are viewing <span className="font-semibold text-white">{city}</span>. Choose the access level for your trip.</> : "Choose the access level that fits your trip."}
            </p>
            {city && <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 font-mono text-[10px] text-[#a6a6ad]"><MapPin className="size-3.5 text-[#f0a63d]" />{city}<span className="text-[#68686f]">·</span>From {source}</div>}
          </div>
        </motion.section>

        {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Panel key={plan.key} delay={index * 0.08} className={plan.featured ? "border-[#5b9dee]/40" : ""}>
              <section className={`relative flex h-full flex-col p-5 ${plan.featured ? "bg-[linear-gradient(145deg,rgba(91,157,238,0.12),transparent_55%)]" : ""}`}>
                {plan.featured && <span className="absolute right-4 top-4 rounded-full border border-[#5b9dee]/40 bg-[#5b9dee]/15 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#7aaff2]">Best value</span>}
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#68686f]">{plan.key === "destination_pack" ? "Destination coverage" : plan.key === "annual" ? "Full access" : "Trip coverage"}</p>
                <h2 className="mt-3 text-base font-bold">{plan.name}</h2>
                <div className="mt-4 flex items-baseline gap-2"><span className="font-mono text-3xl font-bold text-[#f3f3f2]">{plan.price}</span><span className="text-xs text-[#68686f]">{plan.period}</span></div>
                {plan.key === "destination_pack" && <div className="mt-4 rounded-lg border border-white/10 bg-[#101013] px-3 py-2 font-mono text-[10px] text-[#a6a6ad]">Destination: <span className="font-semibold text-[#f3f3f2]">{city || "Choose from a dashboard"}</span></div>}
                <p className="mt-4 min-h-12 text-xs leading-5 text-[#a6a6ad]">{plan.description}</p>
                <ul className="mt-5 flex-1 space-y-3 border-t border-white/10 pt-4 text-xs text-[#a6a6ad]">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-[#3ecf8e]" />{feature}</li>)}</ul>
                <button type="button" onClick={() => startCheckout(plan.key)} disabled={Boolean(busyPlan)} className={`mt-6 flex h-10 w-full items-center justify-center rounded-full text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${plan.featured ? "bg-[#f3f3f2] text-[#111] hover:bg-white" : "border border-white/15 bg-white/[0.04] text-[#f3f3f2] hover:border-white/25 hover:bg-white/[0.08]"}`}>
                  {busyPlan === plan.key && <LoaderCircle className="mr-2 size-3.5 animate-spin" />}Continue to checkout
                </button>
              </section>
            </Panel>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 pb-2 pt-1 font-mono text-[10px] uppercase tracking-wider text-[#68686f]"><span className="live-dot" /> Secure checkout via Dodo Payments</div>
      </div>
    </main>
  );
}

export default function UpgradePage() {
  return <Suspense fallback={<div className="min-h-svh bg-[#0a0a0c] p-8 text-[#a6a6ad]">Loading upgrade options...</div>}><RequireAuth><UpgradeContent /></RequireAuth></Suspense>;
}