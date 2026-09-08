"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  UserRound,
  Pencil,
  CreditCard,
  KeyRound,
  ShieldCheck,
  LogOut,
  Coins,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
import { supabase } from "@/lib/supabase";

function ProfileContent() {
  const router = useRouter();
  const [email, setEmail] = useState("Loading...");
  const [displayName, setDisplayName] = useState("Traveler");
  const [plan, setPlan] = useState("free");
  const [subscription, setSubscription] = useState(null);
  const [resetMsg, setResetMsg] = useState("");
  const [resetErr, setResetErr] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [billingBusy, setBillingBusy] = useState(false);

  useEffect(() => {
    let on = true;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (!on || !data?.user) return;

      setEmail(data.user.email || "No email registered");
      setDisplayName(
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.display_name ||
        data.user.email?.split("@")[0] ||
        "Traveler"
      );

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;

      try {
        const [meRes, billingRes] = await Promise.all([
          fetch("/api/me", { headers: { Authorization: "Bearer " + token } }),
          fetch("/api/billing/subscription", { headers: { Authorization: "Bearer " + token } }),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          if (on && meData.plan) setPlan(meData.plan);
        }
        if (billingRes.ok) {
          const billData = await billingRes.json();
          if (on) setSubscription(billData.subscription || null);
        }
      } catch (err) {
        console.error("Profile load failed:", err);
      }
    })();

    return () => { on = false; };
  }, []);

  async function handleSignOut() {
    await supabase?.auth.signOut();
    router.replace("/login");
  }

  async function handlePasswordReset() {
    setResetMsg("");
    setResetErr("");
    setResetLoading(true);

    if (!email || !email.includes("@")) {
      setResetErr("Valid email not found on this account.");
      setResetLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/login",
      });
      if (error) setResetErr(error.message);
      else setResetMsg("Password reset link sent to your email!");
    } catch (err) {
      setResetErr(err.message || "Failed to send reset link.");
    } finally {
      setResetLoading(false);
    }
  }

  async function handleBillingPortal() {
    if (plan !== "annual") {
      router.push("/dashboard?upgrade=true");
      return;
    }

    setBillingBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
      const json = await res.json();
      if (json.portalUrl) {
        window.location.assign(json.portalUrl);
      }
    } catch (err) {
      console.error("Portal error:", err);
    } finally {
      setBillingBusy(false);
    }
  }

  const isPro = plan === "annual";

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-[#07070a] px-4 py-8 text-[#f3f3f2]">
      
      <div className="w-full max-w-[420px] space-y-4">

        {/* 1. Header with Back Button and Title */}
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#121216] text-[#a6a6ad] transition hover:border-white/20 hover:text-white active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Profile
          </h1>
        </div>

        {/* 2. Main Profile Card (Matching Mockup) */}
        <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-[#121216] p-6 text-center shadow-xl shadow-black/80">
          
          {/* Avatar with soft border */}
          <div className="relative mb-3 flex size-20 items-center justify-center rounded-full border-2 border-white/10 bg-[#1a1a22] text-[#e5484a] shadow-inner">
            <UserRound className="size-10" />
            <span className="absolute bottom-1 right-1 block size-3 rounded-full border-2 border-[#121216] bg-emerald-500" />
          </div>

          {/* User Display Name */}
          <h2 className="text-lg font-bold tracking-tight text-white">
            {displayName}
          </h2>

          {/* User Email */}
          <p className="mt-0.5 text-xs text-[#8e8e98]">
            {email}
          </p>

          {/* Meta Tag */}
          <p className="mt-2 text-[11px] font-medium text-[#686875]">
            Traveler · <span className={isPro ? "text-[#f0a63d] font-bold" : "text-[#8e8e98]"}>{isPro ? "Annual Pro Member" : "Free Plan (3 free cities)"}</span>
          </p>

          {/* Action Button (Orange/Gold Pill matching mockup) */}
          <button
            type="button"
            onClick={handleBillingPortal}
            disabled={billingBusy}
            className="mt-4 flex h-10 items-center justify-center gap-2 rounded-full bg-[#f0a63d] px-6 text-xs font-bold text-black shadow-md shadow-[#f0a63d]/20 transition hover:bg-[#ffb44d] active:scale-95 disabled:opacity-50"
          >
            {billingBusy ? (
              <LoaderCircle className="size-4 animate-spin text-black" />
            ) : isPro ? (
              <Pencil className="size-3.5" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            <span>{isPro ? "Manage Subscription" : "Upgrade to Pro"}</span>
          </button>
        </div>

        {/* 3. Group 1: Preferences & Plan */}
        <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-[#121216]">
          
          {/* Currencies Row */}
          <div className="flex items-center justify-between p-4 transition hover:bg-white/[0.02]">
            <div className="flex items-center gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#5b9dee]">
                <Coins className="size-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Currencies & FX</p>
                <p className="text-[11px] text-[#8e8e98]">Live rates for USD, EUR, INR</p>
              </div>
            </div>
            <span className="text-xs font-mono text-[#5b9dee] font-bold">Auto</span>
          </div>

          {/* Membership / Plan Row */}
          <button
            type="button"
            onClick={handleBillingPortal}
            className="flex w-full items-center justify-between p-4 transition hover:bg-white/[0.02] text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f0a63d]/15 text-[#f0a63d]">
                <CreditCard className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Membership Plan</p>
                <p className="text-[11px] text-[#8e8e98]">
                  {isPro ? "Active Annual Subscription" : "Free Tier · Click to upgrade"}
                </p>
              </div>
            </div>
            <ChevronRight className="size-4 text-[#68686f]" />
          </button>
        </div>

        {/* 4. Group 2: Account Security & Password */}
        <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-[#121216]">
          
          {/* Application Security */}
          <div className="flex items-center justify-between p-4 transition hover:bg-white/[0.02]">
            <div className="flex items-center gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#3ecf8e]">
                <ShieldCheck className="size-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Account Security</p>
                <p className="text-[11px] text-[#8e8e98]">Encrypted via Supabase Auth</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#3ecf8e] uppercase bg-[#3ecf8e]/10 px-2 py-0.5 rounded-full">
              Protected
            </span>
          </div>

          {/* Change Password */}
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={resetLoading}
            className="flex w-full items-center justify-between p-4 transition hover:bg-white/[0.02] text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#a6a6ad]">
                <KeyRound className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Change Password</p>
                <p className="text-[11px] text-[#8e8e98]">Send password reset link to email</p>
              </div>
            </div>
            {resetLoading ? (
              <LoaderCircle className="size-4 animate-spin text-[#a6a6ad]" />
            ) : (
              <ChevronRight className="size-4 text-[#68686f]" />
            )}
          </button>

          {/* Sign Out Row */}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-between p-4 transition hover:bg-red-500/5 text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400 group-hover:bg-red-500/20">
                <LogOut className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-300">Sign Out</p>
                <p className="text-[11px] text-[#8e8e98]">End session on this device</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-red-400/50 group-hover:text-red-400" />
          </button>
        </div>

        {/* Feedback Messages */}
        {resetMsg && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center text-xs text-emerald-300">
            {resetMsg}
          </div>
        )}
        {resetErr && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-300">
            {resetErr}
          </div>
        )}

      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#07070a] text-xs text-[#a6a6ad]">
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