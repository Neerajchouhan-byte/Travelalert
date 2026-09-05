"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

function planLabel(plan) {
  if (plan === "lifetime") return "Lifetime";
  if (plan === "pro") return "Pro plan";
  return "Free plan";
}

function ProfileContent() {
  const router = useRouter();
  const [email, setEmail] = useState("Loading account...");
  const [plan, setPlan] = useState("free");
  const [resetMsg, setResetMsg] = useState("");
  const [resetErr, setResetErr] = useState("");

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