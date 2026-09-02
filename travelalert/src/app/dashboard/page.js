"use client";

import { Suspense } from "react";
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  CloudSun,
  MapPin,
  ShieldAlert,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import { AppSidebar } from "@/app/dashboard/AppSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

function DashboardContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "Bangkok";

  const summary = [
    { label: "Risk level", value: "Moderate", change: "+2.4%", tone: "text-amber-300" },
    { label: "Scam alerts", value: "13", change: "-3 today", tone: "text-rose-300" },
    { label: "Avg. cost", value: "$84", change: "per day", tone: "text-emerald-300" },
    { label: "Routes clear", value: "91%", change: "healthy", tone: "text-sky-300" },
  ];

  const alerts = [
    {
      title: "Taxi meter scam",
      level: "High",
      detail: "Unlicensed drivers around Sukhumvit are inflating fares after 10pm.",
      source: "Local report",
      tone: "border-rose-500/40 bg-rose-500/10",
    },
    {
      title: "ATM skimming hotspot",
      level: "Medium",
      detail: "Card readers were reported near MBK Center and tourist queues.",
      source: "Transit watch",
      tone: "border-amber-500/40 bg-amber-500/10",
    },
    {
      title: "Safe route",
      level: "Low",
      detail: "The BTS to Siam area remains stable with lower tourist pressure.",
      source: "Verified route",
      tone: "border-emerald-500/40 bg-emerald-500/10",
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#060810] text-slate-100">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#0b0f1a]/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">TravelWise</p>
              <h1 className="text-lg font-semibold">Safety dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="rounded-full border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-300">
              Live
            </Badge>
            <Button variant="outline" size="icon" className="h-9 w-9 border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <section className="rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.09),transparent_28%),rgba(15,23,42,0.9)] p-5 md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  {city}
                </div>
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Travel alert overview</h2>
                <p className="mt-2 max-w-xl text-sm text-slate-300">
                  Crowds, transport issues, and scam activity are being tracked in real time for your next trip.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
                  Review routes
                </Button>
                <Button className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                  Run scan
                </Button>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summary.map(({ label, value, change, tone }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-[#0d1320] p-4 shadow-sm shadow-black/20">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
                  <span>{label}</span>
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</div>
                <div className={`mt-2 text-xs ${tone}`}>{change}</div>
              </div>
            ))}
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Active alerts</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  View all <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {alerts.map(({ title, level, detail, source, tone }) => (
                  <div key={title} className={`rounded-xl border p-3 ${tone}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">{title}</div>
                        <div className="mt-1 text-xs text-slate-300">{detail}</div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-black/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-100">
                        {level}
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">{source}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Travel score</h3>
                </div>
                <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-300">Watch</Badge>
              </div>

              <div className="mt-6 flex items-end gap-3">
                <div className="text-5xl font-semibold tracking-tight text-white">74</div>
                <div className="pb-2 text-sm text-slate-400">/ 100</div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[74%] rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500" />
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span>Weather risk</span>
                  <span className="text-amber-300">Moderate</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span>Transit reliability</span>
                  <span className="text-emerald-300">Stable</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span>Scam exposure</span>
                  <span className="text-rose-300">High</span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-4">
              <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <CloudSun className="h-4 w-4 text-sky-400" />
                Weather
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-white">31°</span>
                <span className="text-sm text-slate-400">Feels like 34°</span>
              </div>
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
                Heat risk: keep hydrated and avoid midday transit peaks.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-4">
              <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <Wallet className="h-4 w-4 text-emerald-400" />
                Budget
              </div>
              <div className="text-4xl font-semibold tracking-tight text-white">฿1,240</div>
              <div className="mt-2 text-sm text-slate-400">Estimated spend for 2 days</div>
              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                4% below your usual travel budget.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-4">
              <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                Scam radar
              </div>
              <div className="mt-2 flex items-center justify-center">
                <div className="relative h-24 w-24 rounded-full border border-white/10 bg-[#101827]">
                  <div className="absolute inset-3 rounded-full border border-white/10" />
                  <div className="absolute inset-6 rounded-full border border-white/10" />
                  <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,_rgba(239,68,68,0.8),rgba(239,68,68,0.2),transparent_70%)]" />
                  <div className="absolute inset-7 rounded-full bg-[#0d1320]" />
                </div>
              </div>
              <div className="mt-3 text-center text-sm text-slate-300">
                3 hotspots detected near tourist areas
              </div>
            </div>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#060810] p-8 text-slate-300">Loading dashboard...</main>}>
      <DashboardContent />
    </Suspense>
  );
}