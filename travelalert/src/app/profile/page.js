"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, LoaderCircle, LogOut, UserRound } from "lucide-react";
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

      const me = await fetch("/api/me", {
        headers: { Authorization: "Bearer " + token },
      });
      const json = await me.json().catch(() => ({}));
      if (on && json.plan) setPlan(json.plan);

      const billing = await fetch("/api/billing/subscription", {
        headers: { Authorization: "Bearer " + token },
      });
      const billingJson = await billing.json().catch(() => ({}));
      if (on && billing.ok) setSubscription(billingJson.subscription || null);
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
    if (!supabase) {
      setResetErr("Auth is not configured");
      return;
    }
    const addr = email.includes("@") ? email : "";
    if (!addr) {
      setResetErr("No email on this account");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(addr, {
      redirectTo: window.location.origin + "/login",
    });
    if (error) setResetErr(error.message);
    else setResetMsg("Password reset email sent.");
  }

  async function callBilling(path, busyKey) {
    setBillingError("");
    setBillingNotice("");
    setBillingBusy(busyKey);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch(path, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Billing request failed.");
      if (body.portalUrl) {
        window.location.assign(body.portalUrl);
        return;
      }
      setBillingNotice(body.message || "Your billing preferences were updated.");
      if (path.endsWith("/cancel")) {
        setSubscription((current) =>
          current ? { ...current, cancelAtPeriodEnd: true } : current,
        );
      }
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : "Billing request failed.");
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
    <main className="min-h-svh bg-[#0a0a0c] px-4 py-6 text-[#f3f3f2] sm:px-8">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-3 border-b border-white/10 pb-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-[#a6a6ad] transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>
        <div className="flex size-9 items-center justify-center rounded-full border border-[#e5484a]/40 bg-[#e5484a]/15 text-[#e5484a]">
          <UserRound className="size-4" />
        </div>
      </header>

      <section className="mx-auto max-w-3xl py-8 sm:py-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e5484a]">
          Account
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Profile and settings
        </h1>
        <p className="mt-2 text-sm text-[#a6a6ad]">
          Manage your TravelRadar account from one place.
        </p>

        <div className="mt-8 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Email address</p>
              <p className="mt-1 break-all text-sm text-[#a6a6ad]">{email}</p>
            </div>
            <span className="rounded-full border border-[#f0a63d]/40 bg-[#f0a63d]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#f0a63d]">
              {planLabel(plan)}
            </span>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
            <div>
              <p className="text-sm font-semibold">Password</p>
              <p className="mt-1 text-sm text-[#a6a6ad]">
                Send a reset link to your email.
              </p>
              {resetMsg && (
                <p className="mt-1 text-sm text-emerald-300">{resetMsg}</p>
              )}
              {resetErr && (
                <p className="mt-1 text-sm text-red-300">{resetErr}</p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleReset}
              className="h-10 border-white/10 bg-white/[0.03] text-[#f3f3f2] hover:bg-white/[0.08]"
            >
              Reset password
            </Button>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="mt-1 text-sm text-[#a6a6ad]">
                Scam alerts are shown in your dashboard.
              </p>
            </div>
            <span className="text-xs text-[#68686f]">Coming soon</span>
          </div>
        </div>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="size-4 text-[#f0a63d]" />
                Billing and subscription
              </p>
              <p className="mt-1 text-sm text-[#a6a6ad]">
                {subscription?.status === "past_due"
                  ? "A payment needs attention. Use the billing portal to update it."
                  : subscription?.cancelAtPeriodEnd
                    ? "Your plan remains active until the current billing period ends."
                    : `Current plan: ${subscriptionLabel}.`}
              </p>
              {subscription?.currentPeriodEnd && (
                <p className="mt-1 text-xs text-[#68686f]">
                  Current period ends {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                </p>
              )}
              {billingError && <p role="alert" className="mt-2 text-sm text-red-300">{billingError}</p>}
              {billingNotice && <p role="status" className="mt-2 text-sm text-emerald-300">{billingNotice}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {subscription?.canManage && (
                <Button
                  variant="outline"
                  onClick={() => callBilling("/api/billing/portal", "portal")}
                  disabled={Boolean(billingBusy)}
                  className="h-10 border-white/10 bg-white/[0.03] text-[#f3f3f2] hover:bg-white/[0.08]"
                >
                  {billingBusy === "portal" && <LoaderCircle className="size-4 animate-spin" />}
                  Manage billing
                </Button>
              )}
              {subscription?.plan === "annual" && !subscription?.cancelAtPeriodEnd && (
                <Button
                  variant="outline"
                  onClick={() => callBilling("/api/billing/cancel", "cancel")}
                  disabled={Boolean(billingBusy)}
                  className="h-10 border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                >
                  {billingBusy === "cancel" && <LoaderCircle className="size-4 animate-spin" />}
                  Cancel at period end
                </Button>
              )}
              {subscription?.plan === "free" && (
                <Link href="/#pricing" className="btn-primary h-10 px-4 text-sm">View plans</Link>
              )}
            </div>
          </div>
        </section>

        <Button
          variant="outline"
          onClick={handleSignOut}
          className="mt-6 h-10 border-white/10 bg-white/[0.03] text-[#f3f3f2] hover:bg-white/[0.08]"
        >
          <LogOut className="size-4" />
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