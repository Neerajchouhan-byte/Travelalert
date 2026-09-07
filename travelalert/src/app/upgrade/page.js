"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle, ShieldCheck } from "lucide-react";
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
  const [subscription, setSubscription] = useState(null);
  const [busyPlan, setBusyPlan] = useState("");
  const [error, setError] = useState("");

  // Load existing subscription if logged in
  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const headers = await authHeaders();
        if (!headers) return;
        const response = await fetch("/api/billing/subscription", { headers });
        const body = await response.json().catch(() => ({}));
        if (current && response.ok) setSubscription(body.subscription);
      } catch {
        // Silently fail if not logged in
      }
    })();
    return () => {
      current = false;
    };
  }, []);

  async function checkout(plan) {
    setError("");

    if (plan === "destination_pack" && (!city || city.trim().length < 2)) {
      router.push("/dashboard");
      return;
    }

    const headers = await authHeaders();
    if (!headers) {
      const returnUrl = city ? `/upgrade?city=${encodeURIComponent(city)}` : "/upgrade";
      router.push(`/login?next=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setBusyPlan(plan);

    try {
      const payload = { plan };
      if (plan === "destination_pack" && city) {
        payload.destination = city;
      }

      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.checkoutUrl) {
        throw new Error(body.error || "Checkout could not be started.");
      }

      window.location.assign(body.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout could not be started.");
      setBusyPlan("");
    }
  }

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="min-h-screen py-10" style={{ opacity: 1 }}>
      <div className="container" style={{ opacity: 1 }}>
        {/* Back Link */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            href={city ? `/dashboard?city=${encodeURIComponent(city)}` : "/dashboard"}
            className="btn-ghost"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.8125rem",
              padding: "0.45rem 0.9rem",
              textDecoration: "none",
            }}
          >
            <ArrowLeft className="size-3.5" /> Back to dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="sec-head" style={{ marginInline: "auto", textAlign: "center", opacity: 1 }}>
          <span className="eyebrow">Flexible access</span>
          <h2 id="pricing-title">Choose coverage that fits your journey.</h2>
        </div>

        {/* Anchor Note */}
        <div className="price-anchor" style={{ opacity: 1 }}>
          One-off options never renew. Annual access is billed once per year—there is no monthly plan.
        </div>

        {/* Error notification */}
        {error && (
          <p
            role="alert"
            className="price-anchor"
            style={{ borderColor: "rgba(229,72,74,.55)", color: "#fecaca", opacity: 1 }}
          >
            {error}
          </p>
        )}

        {/* Grid Cards */}
        <div className="pricing-grid" style={{ opacity: 1 }}>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`p-card ${plan.featured ? "pop" : ""}`}
              style={{ "--i": index, opacity: 1 }}
              whileHover={{ y: -6 }}
            >
              {plan.featured && <span className="pop-badge">Best value</span>}
              <span className="p-name">{plan.name}</span>
              <div className="p-price">
                <span className="amt">{plan.price}</span>
                <span className="per">{plan.period}</span>
              </div>
              <p className="p-desc">{plan.description}</p>
              <ul className="p-feats">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check className="size-3.5 shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={plan.featured ? "btn-primary btn-block" : "btn-ghost btn-block"}
                onClick={() => checkout(plan.key)}
                disabled={Boolean(busyPlan)}
                aria-busy={busyPlan === plan.key}
                style={plan.featured ? { justifyContent: "center", padding: "0.85rem 1.5rem" } : undefined}
              >
                {busyPlan === plan.key && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                {plan.action}
              </button>
              {plan.key === "annual" && subscription?.plan === "annual" && (
                <p className="p-note">Your Annual plan is active.</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer Guarantee */}
        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-[#a6a6ad]">
          <ShieldCheck className="size-4 text-emerald-400" aria-hidden="true" />
          Secure checkout and access confirmation by Dodo Payments.
        </p>
      </div>
    </section>
  );
}

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoaderCircle className="size-8 animate-spin text-[#5b9dee]" />
        </div>
      }
    >
      <UpgradeContent />
    </Suspense>
  );
}