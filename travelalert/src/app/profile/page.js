"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  LoaderCircle,
  LogOut,
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

      // Fetch user plan and billing data in parallel
      const [meResponse, billingResponse] = await Promise.all([
        fetch("/api/me", { headers: { Authorization: "Bearer " + token } }),
        fetch("/api/billing/subscription", { headers: { Authorization: "Bearer " + token } })
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
    <main className="min-h-svh bg-[#0a0a0c] text-[#f3f3f2]">
      <section className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#a6a6ad] transition hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Back to dashboard
        </Link>

        {/* Account Header */}
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full border border-[#e5484a]/40 bg-[#e5484a]/15 text-[#e5484a]">
            <UserRound className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Your profile</h1>
            <p className="text-sm text-[#a6a6ad]">{email}</p>
          </div>
        </div>

        {/* Account Details Card */}
        <section className="rounded-[1.1rem] border border-white/10 bg-white/[0.045] p-[0.3rem]">
          <div className="rounded-[0.8rem] bg-[#141418] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#68686f]">
                  Current Plan
                </p>
                <p className="mt-1 text-sm font-semibold text-[#f3f3f2]">{planLabel(plan)}</p>
                <p className="mt-1 text-xs text-[#a6a6ad]">
                  {plan === "annual"
                    ? "Full access to all destinations"
                    : plan === "trip_pass"
                      ? "30-day access to all destinations"
                      : "Limited access · 3 free searches"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {plan !== "annual" && (
                  <Link
                    href="/upgrade"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-[#f3f3f2] px-4 text-sm font-medium text-[#111] transition hover:bg-white"
                  >
                    Upgrade
                  </Link>
                )}
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={resetLoading}
                  className="h-9 border-white/10 bg-white/[0.03] text-sm text-[#f3f3f2] hover:bg-white/[0.08]"
                >
                  {resetLoading && <LoaderCircle className="mr-2 size-3.5 animate-spin" />}
                  Reset password
                </Button>
              </div>
            </div>
            {resetMsg && (
              <p className="mt-3 text-sm text-emerald-300">{resetMsg}</p>
            )}
            {resetErr && (
              <p className="mt-3 text-sm text-red-300">{resetErr}</p>
            )}
          </div>
        </section>

        {/* Notifications Card */}
        <section className="rounded-[1.1rem] border border-white/10 bg-white/[0.045] p-[0.3rem]">
          <div className="rounded-[0.8rem] bg-[#141418] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#68686f]">
                  Notifications
                </p>
                <p className="mt-1 text-sm text-[#a6a6ad]">
                  Scam alerts are shown in your dashboard.
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-[#68686f]">
                Coming soon
              </span>
            </div>
          </div>
        </section>

        {/* Billing Card */}
        <section className="rounded-[1.1rem] border border-white/10 bg-white/[0.045] p-[0.3rem]">
          <div className="rounded-[0.8rem] bg-[#141418] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-[#f3f3f2]">
                  <CreditCard className="size-4 text-[#f0a63d]" />
                  Billing and subscription
                </p>
                <p className="mt-1.5 text-sm text-[#a6a6ad]">
                  {subscription?.status === "past_due"
                    ? "A payment needs attention. Use the billing portal to update it."
                    : subscription?.cancelAtPeriodEnd
                      ? "Your plan remains active until the current billing period ends."
                      : `Current plan: ${subscriptionLabel}.`}
                </p>
                {subscription?.currentPeriodEnd && (
                  <p className="mt-1 text-xs text-[#68686f]">
                    Current period ends{" "}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
                {billingError && (
                  <p role="alert" className="mt-3 text-sm text-red-300">
                    {billingError}
                  </p>
                )}
                {billingNotice && (
                  <p role="status" className="mt-3 text-sm text-emerald-300">
                    {billingNotice}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {subscription?.canManage && (
                  <Button
                    variant="outline"
                    onClick={() => callBilling("/api/billing/portal", "portal")}
                    disabled={Boolean(billingBusy)}
                    className="h-9 border-white/10 bg-white/[0.03] text-sm text-[#f3f3f2] hover:bg-white/[0.08]"
                  >
                    {billingBusy === "portal" && (
                      <LoaderCircle className="mr-2 size-3.5 animate-spin" />
                    )}
                    Manage billing
                  </Button>
                )}
                {subscription?.plan === "annual" &&
                  !subscription?.cancelAtPeriodEnd && (
                    <Button
                      variant="outline"
                      onClick={() => callBilling("/api/billing/cancel", "cancel")}
                      disabled={Boolean(billingBusy)}
                      className="h-9 border-red-500/30 bg-red-500/10 text-sm text-red-200 hover:bg-red-500/20"
                    >
                      {billingBusy === "cancel" && (
                        <LoaderCircle className="mr-2 size-3.5 animate-spin" />
                      )}
                      Cancel at period end
                    </Button>
                  )}
                {subscription?.plan === "free" && (
                  <Link
                    href="/upgrade"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-[#f3f3f2] px-4 text-sm font-medium text-[#111] transition hover:bg-white"
                  >
                    Upgrade access
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="h-9 border-white/10 bg-white/[0.03] text-sm text-[#f3f3f2] hover:bg-white/[0.08]"
        >
          <LogOut className="mr-2 size-3.5" />
          Sign out
        </Button>
      </section>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh bg-[#0a0a0c] p-8 text-[#a6a6ad]">
          Checking session...
        </div>
      }
    >
      <RequireAuth>
        <ProfileContent />
      </RequireAuth>
    </Suspense>
  );
}
