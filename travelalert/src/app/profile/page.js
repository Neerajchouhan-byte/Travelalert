"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  KeyRound,
  Link as LinkIcon,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
import { supabase } from "@/lib/supabase";

function planLabel(plan) {
  if (plan === "annual") return "Annual Plan (Unlimited)";
  if (plan === "trip_pass") return "Pass (30 days)";
  return "Free Plan (3 free cities)";
}

function ProfileContent() {
  const router = useRouter();
  const [email, setEmail] = useState("Loading account...");
  const [userName, setUserName] = useState("");
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

      const metaName =
        data?.user?.user_metadata?.full_name ||
        data?.user?.user_metadata?.display_name ||
        data?.user?.user_metadata?.name;
      if (metaName) {
        setUserName(metaName);
      } else if (data?.user?.email) {
        const localPart = data.user.email.split("@")[0];
        setUserName(
          localPart
            .split(/[._-]/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        );
      }

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
    else setResetMsg("Password reset email sent. Check your inbox.");
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

  const membershipSubtitle =
    plan === "annual"
      ? "Annual Member · Click to manage"
      : plan === "trip_pass"
        ? "Per-trip Pass · Active"
        : "Free Tier · Click to upgrade";

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-6 text-zinc-900 transition-colors duration-200 sm:py-10 dark:bg-[#0c0c0e] dark:text-[#f3f3f2]">
      <div className="mx-auto w-full max-w-[580px] space-y-4 sm:space-y-5">

        {/* Header with Circular Back Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex size-9 items-center justify-center rounded-full bg-zinc-200/70 text-zinc-700 transition-colors hover:bg-zinc-300/80 dark:border dark:border-white/10 dark:bg-[#1c1c24] dark:text-zinc-300 dark:hover:bg-white/10"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="size-4.5" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-white">
            Profile
          </h1>
        </div>

        {/* Card 1: User Identity Card */}
        <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 text-center shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#16161b]">
          {/* Avatar circle with red user outline and green status dot */}
          <div className="mx-auto relative flex size-24 items-center justify-center rounded-full bg-zinc-100 dark:border dark:border-white/10 dark:bg-[#22222a]">
            <UserRound className="size-10 text-[#e5283b] stroke-[1.75] dark:text-[#f87171]" />
            <span className="absolute bottom-1 right-2 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#16161b]" />
          </div>

          {/* Name & Email */}
          <h2 className="mt-4 text-lg font-black tracking-tight text-zinc-900 sm:text-xl dark:text-white">
            {userName || "Traveler"}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {email}
          </p>

          {/* Plan line */}
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Traveler · {planLabel(plan)}
          </p>

          {/* Upgrade Button */}
          <div className="mt-5 flex justify-center">
            {plan !== "annual" ? (
              <Link
                href="/dashboard?upgrade=true"
                className="inline-flex items-center gap-1.5 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 dark:border dark:border-white/20 dark:bg-black"
              >
                <Sparkles className="size-3.5" />
                <span>Upgrade to Pro</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => callBilling("/api/billing/portal", "portal")}
                disabled={Boolean(billingBusy)}
                className="inline-flex items-center gap-1.5 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 dark:border dark:border-white/20 dark:bg-black"
              >
                {billingBusy === "portal" ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5 text-emerald-400" />
                )}
                <span>Manage Subscription</span>
                {subscription?.plan === "annual" && !subscription?.cancelAtPeriodEnd && (
                  <button
                    type="button"
                    onClick={() => callBilling("/api/billing/cancel", "cancel")}
                    disabled={Boolean(billingBusy)}
                  >
                    {billingBusy === "cancel" ? "Cancelling…" : "Cancel renewal"}
                  </button>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Currencies & Membership Plan */}
        <div className="divide-y divide-zinc-100 overflow-hidden rounded-[26px] border border-zinc-200/90 bg-white shadow-sm dark:divide-white/5 dark:border-white/10 dark:bg-[#16161b]">
          {/* Currencies & FX */}
          <div className="flex items-center justify-between p-4 sm:p-5">
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-[#e5283b] dark:bg-red-950/50 dark:text-[#f87171]">
                <LinkIcon className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  Currencies &amp; FX
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Live rates for USD, EUR, INR
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-[#e5283b] dark:text-[#f87171]">
              Auto
            </span>
          </div>

          {/* Membership Plan */}
          <button
            type="button"
            onClick={() => {
              if (subscription?.canManage) {
                callBilling("/api/billing/portal", "portal");
              } else {
                router.push("/dashboard?upgrade=true");
              }
            }}
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-zinc-50/70 sm:p-5 dark:hover:bg-white/[0.03]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <CreditCard className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  Membership Plan
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {membershipSubtitle}
                </p>
              </div>
            </div>
            <ChevronRight className="size-4 text-zinc-400 dark:text-zinc-500" />
          </button>
        </div>

        {/* Card 3: Account Security, Password, Sign Out */}
        <div className="divide-y divide-zinc-100 overflow-hidden rounded-[26px] border border-zinc-200/90 bg-white shadow-sm dark:divide-white/5 dark:border-white/10 dark:bg-[#16161b]">
          {/* Account Security */}
          <div className="flex items-center justify-between p-4 sm:p-5">
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  Account Security
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Encrypted via Supabase Auth
                </p>
              </div>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-400">
              PROTECTED
            </span>
          </div>

          {/* Change Password */}
          <button
            type="button"
            onClick={handleReset}
            disabled={resetLoading}
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-zinc-50/70 sm:p-5 dark:hover:bg-white/[0.03]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                <KeyRound className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  Change Password
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Send password reset link to email
                </p>
              </div>
            </div>
            {resetLoading ? (
              <LoaderCircle className="size-4 animate-spin text-zinc-400" />
            ) : (
              <ChevronRight className="size-4 text-zinc-400 dark:text-zinc-500" />
            )}
          </button>

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-red-50/30 sm:p-5 dark:hover:bg-red-950/10"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-[#e5283b] dark:bg-red-950/50 dark:text-[#f87171]">
                <LogOut className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#e5283b] dark:text-[#f87171]">
                  Sign Out
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  End session on this device
                </p>
              </div>
            </div>
            <ChevronRight className="size-4 text-[#e5283b] dark:text-[#f87171]" />
          </button>
        </div>

        {/* Notices and Errors */}
        {resetMsg && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-xs font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
            {resetMsg}
          </p>
        )}
        {resetErr && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-xs font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
            {resetErr}
          </p>
        )}
        {billingNotice && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-xs font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
            {billingNotice}
          </p>
        )}
        {billingError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-xs font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
            {billingError}
          </p>
        )}

      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f7f6f2] text-sm text-zinc-500 dark:bg-[#0c0c0e]">
          <LoaderCircle className="mr-2 size-4 animate-spin" /> Loading profile...
        </div>
      }
    >
      <RequireAuth>
        <ProfileContent />
      </RequireAuth>
    </Suspense>
  );
}