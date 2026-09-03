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

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
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

        if (orgData.error && (!orgData.alerts || orgData.alerts.length === 0)) {
          setError(orgData.error);
        }
        setAlerts(orgData.alerts || []);
      } catch {
        setError("Could not organize alerts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [city]);

  return (
    <RequireAuth>
      <>
        <Topbar city={city} />
        <div className="space-y-4 p-8 max-md:p-4">
          <DestinationHeader city={city} />

          {/* Step 25 — temporary proof that Reddit works */}
          {loading && (
            <p className="text-sm text-[#a6a6ad]">Loading Reddit reports…</p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <ul className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            {posts.map((p, i) => (
              <li
                key={i}
                className="border-b border-white/5 py-2 last:border-0"
              >
                r/{p.sub}: {p.title}
              </li>
            ))}
          </ul>

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
