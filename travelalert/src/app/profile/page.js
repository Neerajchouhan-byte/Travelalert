"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

function ProfileContent() {
  const router = useRouter();
  const [email, setEmail] = useState("Loading account...");

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      setEmail(data?.user?.email || "Account email unavailable");
    });
  }, []);

  async function handleSignOut() {
    await supabase?.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="min-h-svh bg-[#0a0a0c] px-8 py-6 text-[#f3f3f2] max-md:px-4">
      <header className="mx-auto flex max-w-3xl items-center justify-between border-b border-white/10 pb-5">
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

      <section className="mx-auto max-w-3xl py-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e5484a]">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Profile and settings</h1>
        <p className="mt-2 text-sm text-[#a6a6ad]">
          Manage your TravelRadar account from one place.
        </p>

        <div className="mt-8 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center justify-between gap-4 p-5 max-sm:flex-col max-sm:items-start">
            <div>
              <p className="text-sm font-semibold">Email address</p>
              <p className="mt-1 text-sm text-[#a6a6ad]">{email}</p>
            </div>
            <span className="rounded-full border border-[#f0a63d]/40 bg-[#f0a63d]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#f0a63d]">
              Free plan
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 p-5 max-sm:flex-col max-sm:items-start">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="mt-1 text-sm text-[#a6a6ad]">Scam alerts are shown in your dashboard.</p>
            </div>
            <span className="text-xs text-[#68686f]">Coming soon</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleSignOut}
          className="mt-6 border-white/10 bg-white/[0.03] text-[#f3f3f2] hover:bg-white/[0.08]"
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
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}