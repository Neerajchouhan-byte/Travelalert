"use client";
import { supabase } from "@/lib/supabase";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/dashboard/Topbar";
import { DestinationHeader } from "@/components/dashboard/DestinationHeader";
import { ScamAlerts } from "@/components/dashboard/ScamAlerts";
import { InsiderTips } from "@/components/dashboard/InsiderTips";
import { CurrencyCard } from "@/components/dashboard/CurrencyCard";
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
  const [source, setSource] = useState("");
  const [brief, setBrief] = useState(null);
  const [briefCity, setBriefCity] = useState("");
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setAlerts([]);
      setTips([]);
      setSource("");
      try {
        const res = await fetch(
          "/api/briefing?city=" + encodeURIComponent(city),
          { cache: "no-store" },
        );
        const data = await res.json();
        if (cancelled) return;

        setAlerts(data.alerts || []);
        setTips(data.tips || []);
        setSource(data.source || "");

        if (data.error && !(data.alerts || []).length) {
          setError(data.error);
        }

        if (supabase) {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          if (token) {
            const me = await fetch("/api/me", {
              headers: { Authorization: "Bearer " + token },
            });
            const meData = await me.json();
            if (!cancelled) setPlan(meData.plan || "free");
          }
        }
      } catch {
        if (!cancelled) setError("Could not load this destination");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [city]);

  return (
    <RequireAuth>
      <>
        <Topbar key={city} city={city} />
        <div className="space-y-4 p-8 max-md:p-4">
          <DestinationHeader
            city={city}
            brief={briefCity === city ? brief : null}
          />

          {source && (
            <p className="text-xs text-[#a6a6ad]">
              {source === "cache"
                ? "Served from cache (under 24 hours)"
                : "Fresh scan"}
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <ScamAlerts alerts={alerts} loading={loading} plan={plan} />
            <InsiderTips
              tips={tips}
              loading={loading}
              city={city}
              plan={plan}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <CurrencyCard brief={brief} />
            <WeatherCard brief={brief} />
          </div>
          <RecentActivity city={city} alerts={alerts} loading={loading} />
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
