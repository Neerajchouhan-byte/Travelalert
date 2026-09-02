"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/dashboard/Topbar";
import { DestinationHeader } from "@/components/dashboard/DestinationHeader";
import { ScamAlerts } from "@/components/dashboard/ScamAlerts";
import { InsiderTips } from "@/components/dashboard/InsiderTips";
import { CurrencyCard } from "@/components/dashboard/CurrencyCard";
import { ScamRadar } from "@/components/dashboard/ScamRadar";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DestinationChips } from "@/components/dashboard/DestinationChips";

function DashboardContent() {
  const city = useSearchParams().get("city") || "Bangkok";

  return (
    <>
      <Topbar city={city} />
      <div className="space-y-4 p-8 max-md:p-4">
        <DestinationHeader city={city} />
        <div className="grid gap-4 lg:grid-cols-2">
          <ScamAlerts />
          <InsiderTips />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CurrencyCard />
          <ScamRadar />
          <WeatherCard />
        </div>
        <RecentActivity />
        <DestinationChips active={city} />
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#a6a6ad]">Loading dashboard…</div>}>
      <DashboardContent />
    </Suspense>
  );
}