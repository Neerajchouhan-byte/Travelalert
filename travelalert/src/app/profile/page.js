"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CreditCard,
  KeyRound,
  LoaderCircle,
  LogOut,
  Shield,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

function planLabel(plan) {
  if (plan === "annual") return "Annual access";
  if (plan === "trip_pass") return "Per-trip Pass";
  return "Free access";
}

function ProfileContent() {
  const router = useRouter();
  const [email, setEmail] = useState("Loading account...");
  const [plan, setPlan] = useState("free");
  const [resetMsg, setResetMsg] = useState("");
  const [resetErr, setResetErr] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [billingBusy, setBillingBusy] = useState("");
  const [billingError, setBillingError] = useState("");
  const [billingNotice, setBillingNotice] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    let on = true;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (!on) return;
      setEmail(data?.user?.email || "Account email unavailable");

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;

      const [meResponse, billingResponse] = await Promise.all([
        fetch("/api/me", { headers: { Authorization: "Bearer " + token } }),
        fetch("/api/billing/subscription", {
          headers: { Authorization: "Bearer " + token },
        }),
      ]);

      const json = await meResponse.json().catch(() => ({}));
      if (on && json.plan) setPlan(json.plan);

      const billingJson = await billingResponse.json().catch(() => ({}));
      if (on && billingResponse.ok) setSubscription(billingJson.subscription || null);
    })();
    return () => {
      on = false;
    };
  }, []);

  async function handleSignOut() {
    await supabase?.auth.signOut();
    router.replace("/login");
  }

  async function handleReset() {
    setResetMsg("");
    setResetErr("");
    setResetLoading(true);
    if (!supabase) {
      setResetErr("Auth is not configured");
      setResetLoading(false);
      return;
    }
    const addr = email.includes("@") ? email : "";
    if (!addr) {
      setResetErr("No email on this account");
      setResetLoading(false);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(addr, {
      redirectTo: window.location.origin + "/login",
    });
    if (error) setResetErr(error.message);
    else setResetMsg("Password reset email sent.");
    setResetLoading(false);
  }

  async function callBilling(path, busyKey) {
    setBillingError("");
    setBillingNotice("");
    setBillingBusy(busyKey);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token)
        throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(path, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(body.error || "Billing request failed.");
      if (body.portalUrl) {
        window.location.assign(body.portalUrl);
        return;
      }
      setBillingNotice(
        body.message || "Your billing preferences were updated.",
      );
      if (path.endsWith("/cancel")) {
        setSubscription((current) =>
          current ? { ...current, cancelAtPeriodEnd: true } : current,
        );
      }
    } catch (error) {
      setBillingError(
        error instanceof Error ? error.message : "Billing request failed.",
      );
    } finally {
      setBillingBusy("");
    }
  }

  const subscriptionLabel =
    subscription?.plan === "annual"
      ? "Annual access"
      : subscription?.plan === "trip_pass"
        ? "Per-trip Pass"
        : "Free access";

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-[#f3f3f2] selection:bg-[#e5484a]/20">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        
        {/* Top Back Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#141418] p-2 pr-4 text-xs font-medium text-[#a6a6ad] transition hover:border-white/20 hover:text-white"
          >
            <div className="flex size-6 items-center justify-center rounded-full bg-white/5 transition group-hover:bg-white/10">
              <ArrowLeft className="size-3.5" />
            </div>
            Back to dashboard
          </Link>

          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-xs text-[#a6a6ad] hover:bg-white/5 hover:text-red-400"
          >
            <LogOut className="mr-2 size-3.5" />
            Sign out
          </Button>
        </div>

        {/* Responsive Grid: 1 Column on Mobile, 2 Columns on Laptop/Desktop */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: User Profile Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 flex flex-col items-center rounded-3xl border border-white/10 bg-[#141418]/80 p-6 text-center shadow-xl backdrop-blur-sm sm:p-8">
              {/* Profile Avatar */}
              <div className="relative mb-4 flex size-24 items-center justify-center rounded-full border-2 border-[#e5484a]/40 bg-gradient-to-b from-[#e5484a]/20 to-transparent text-[#e5484a] shadow-inner">
                <UserRound className="size-11" />
                <span className="absolute bottom-1 right-1 block size-3.5 rounded-full border-2 border-[#141418] bg-emerald-500" />
              </div>

              {/* User Email & Identity */}
              <h1 className="max-w-full truncate text-lg font-bold tracking-tight text-[#f3f3f2]">
                {email.split("@")[0]}
              </h1>
              <p className="mt-1 max-w-full truncate text-xs text-[#a6a6ad]">
                {email}
              </p>

              {/* Status Pill Badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#a6a6ad]">
                <Sparkles className="size-3 text-[#e5484a]" />
                <span>{planLabel(plan)}</span>
              </div>

              {/* Primary Action Button */}
              <div className="mt-6 w-full">
                {plan !== "annual" ? (
                  <Link
                    href="/dashboard?upgrade=true"
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#e5484a] text-sm font-semibold text-white shadow-lg shadow-[#e5484a]/20 transition duration-150 hover:bg-[#d43d3f] active:scale-[0.99]"
                  >
                    <Sparkles className="size-4" />
                    Upgrade Plan
                  </Link>
                ) : (
                  <div className="flex h-11 w-full items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-medium text-emerald-400">
                    Active Annual Membership
                  </div>
                )}
              </div>

              <div className="mt-4 w-full border-t border-white/5 pt-4 text-left">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#68686f]">
                  Account Status
                </p>
                <p className="mt-1 text-xs text-[#a6a6ad]">
                  {plan === "annual"
                    ? "Full unlimited destination access active."
                    : plan === "trip_pass"
                    ? "30-day access is currently active."
                    : "Limited access · 3 free searches."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Settings, Security & Billing Cards */}
          <div className="space-y-6 lg:col-span-7">
            
            {/* Section 1: Security & Credentials */}
            <div>
              <p className="mb-2.5 px-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#68686f]">
                Security
              </p>
              <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-[#141418]">
                {/* Reset Password Row */}
                <div className="p-4 transition hover:bg-white/[0.02] sm:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-[#a6a6ad]">
                        <KeyRound className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#f3f3f2]">
                          Account Password
                        </p>
                        <p className="text-xs text-[#a6a6ad]">
                          Send a reset link to your registered email
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={resetLoading}
                      className="h-8 shrink-0 rounded-lg border-white/10 bg-white/[0.03] px-3 text-xs text-[#f3f3f2] hover:bg-white/[0.08]"
                    >
                      {resetLoading ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        "Reset"
                      )}
                    </Button>
                  </div>

                  {resetMsg && (
                    <p className="mt-3 text-xs text-emerald-400">{resetMsg}</p>
                  )}
                  {resetErr && (
                    <p className="mt-3 text-xs text-red-400">{resetErr}</p>
                  )}
                </div>

                {/* Security Status Row */}
                <div className="flex items-center justify-between p-4 transition hover:bg-white/[0.02] sm:p-5">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-[#a6a6ad]">
                      <Shield className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#f3f3f2]">
                        Authentication Security
                      </p>
                      <p className="text-xs text-[#a6a6ad]">
                        Secured via Supabase OAuth / Magic link
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-[#68686f]" />
                </div>
              </div>
            </div>

            {/* Section 2: Billing & Subscription */}
            <div>
              <p className="mb-2.5 px-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#68686f]">
                Billing & Subscription
              </p>
              <div className="rounded-2xl border border-white/10 bg-[#141418] p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f0a63d]/10 text-[#f0a63d]">
                    <CreditCard className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#f3f3f2]">
                        {subscriptionLabel}
                      </p>
                      {subscription?.cancelAtPeriodEnd && (
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                          Cancels soon
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-[#a6a6ad]">
                      {subscription?.status === "past_due"
                        ? "Payment requires attention. Update it via the portal."
                        : subscription?.cancelAtPeriodEnd
                        ? "Your plan remains active until the billing period ends."
                        : `Your subscription is active.`}
                    </p>

                    {subscription?.currentPeriodEnd && (
                      <p className="mt-2 font-mono text-[11px] text-[#68686f]">
                        Renews / ends on{" "}
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}

                    {billingError && (
                      <p className="mt-3 text-xs text-red-400">{billingError}</p>
                    )}
                    {billingNotice && (
                      <p className="mt-3 text-xs text-emerald-400">
                        {billingNotice}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2 pt-2">
                      {subscription?.canManage && (
                        <Button
                          variant="outline"
                          onClick={() => callBilling("/api/billing/portal", "portal")}
                          disabled={Boolean(billingBusy)}
                          className="h-8 rounded-lg border-white/10 bg-white/[0.04] text-xs text-[#f3f3f2] hover:bg-white/[0.08]"
                        >
                          {billingBusy === "portal" && (
                            <LoaderCircle className="mr-2 size-3 animate-spin" />
                          )}
                          Manage Billing
                        </Button>
                      )}

                      {subscription?.plan === "annual" &&
                        !subscription?.cancelAtPeriodEnd && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              callBilling("/api/billing/cancel", "cancel")
                            }
                            disabled={Boolean(billingBusy)}
                            className="h-8 rounded-lg border-red-500/30 bg-red-500/10 text-xs text-red-200 hover:bg-red-500/20"
                          >
                            {billingBusy === "cancel" && (
                              <LoaderCircle className="mr-2 size-3 animate-spin" />
                            )}
                            Cancel at period end
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Preferences / Notifications */}
            <div>
              <p className="mb-2.5 px-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#68686f]">
                Preferences
              </p>
              <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-[#141418]">
                <div className="flex items-center justify-between p-4 sm:p-5">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-[#a6a6ad]">
                      <Bell className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#f3f3f2]">
                        Scam & Alert Notifications
                      </p>
                      <p className="text-xs text-[#a6a6ad]">
                        Receive urgent alerts directly on your dashboard
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-[#68686f]">
                    Coming soon
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] text-sm text-[#a6a6ad]">
          <LoaderCircle className="mr-2 size-4 animate-spin" /> Checking session...
        </div>
      }
    >
      <RequireAuth>
        <ProfileContent />
      </RequireAuth>
    </Suspense>
  );
}