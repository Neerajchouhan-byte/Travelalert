"use client";

import { Suspense, useEffect, useState } from "react";
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
import { RequireAuth } from "@/components/dashboard/RequireAuth";

function DashboardContent() {
  const city = useSearchParams().get("city") || "Bangkok";

  const [alerts, setAlerts] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      setAlerts([]);
      setTips([]);
      try {
        const redditRes = await fetch(
          "/api/reddit?city=" + encodeURIComponent(city),
        );
        const redditData = await redditRes.json();

        const orgRes = await fetch("/api/organize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city,
            posts: redditData.posts || [],
          }),
        });
        const orgData = await orgRes.json();

        const all = orgData.alerts || [];
        setAlerts(all.filter((a) => a.severity !== "tip"));
        setTips(
          orgData.tips?.length
            ? orgData.tips
            : all.filter((a) => a.severity === "tip"),
        );

        if (orgData.error && all.length === 0) setError(orgData.error);
      } catch {
        setError("Could not load this destination");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [city]);

  const [brief, setBrief] = useState(null);

  useEffect(() => {
    let on = true;
    setBrief(null);
    fetch("/api/city-brief?city=" + encodeURIComponent(city))
      .then((r) => r.json())
      .then((d) => on && setBrief(d));
    return () => {
      on = false;
    };
  }, [city]);
  return (
    <RequireAuth>
      <>
        <Topbar city={city} />
        <div className="space-y-4 p-8 max-md:p-4">
          <DestinationHeader city={city} />

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <ScamAlerts alerts={alerts} loading={loading} />
            <InsiderTips tips={tips} loading={loading} city={city} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CurrencyCard brief={brief} />
            <ScamRadar />
            <WeatherCard brief={brief} />
          </div>
          <RecentActivity />
          <DestinationChips active={city} />
        </div>
      </>
    </RequireAuth>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-[#a6a6ad]">Loading dashboard…</div>}
    >
      <DashboardContent />
    </Suspense>
  );
}
