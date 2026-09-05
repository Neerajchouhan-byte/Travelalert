"use client";
import { supabase } from "@/lib/supabase";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/dashboard/Topbar";
import { DestinationHeader } from "@/components/dashboard/DestinationHeader";
import { ScamAlerts } from "@/components/dashboard/ScamAlerts";
import { InsiderTips } from "@/components/dashboard/InsiderTips";
import { CurrencyCard } from "@/components/dashboard/CurrencyCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DestinationChips } from "@/components/dashboard/DestinationChips";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
import { useRouter, useSearchParams } from "next/navigation";

function DashboardContent() {
  const city = useSearchParams().get("city") || "Bangkok";
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [brief, setBrief] = useState(null);
  const [briefCity, setBriefCity] = useState("");
  const [plan, setPlan] = useState("free");
  const [lockedAlerts, setLockedAlerts] = useState(0);
  const [lockedTips, setLockedTips] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setAlerts([]);
      setTips([]);
      setSource("");

      try {
        let headers = {};
        if (supabase) {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          if (token) headers = { Authorization: "Bearer " + token };
        }

        const res = await fetch(
          "/api/briefing?city=" + encodeURIComponent(city),
          { cache: "no-store", headers },
        );

        if (res.status === 401) {
          router.replace("/login?city=" + encodeURIComponent(city));
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        setAlerts(data.alerts || []);
        setTips(data.tips || []);
        setSource(data.source || "");
        setPlan(data.plan || "free");
        setLockedAlerts(data.lockedAlerts || 0);
        setLockedTips(data.lockedTips || 0);

        if (data.error && !(data.alerts || []).length) {
          setError(data.error);
        }

        const briefRes = await fetch(
          "/api/city-brief?city=" + encodeURIComponent(city),
          { cache: "no-store", headers },
        );
        if (briefRes.ok) {
          const briefData = await briefRes.json();
          if (!cancelled) {
            setBrief(briefData);
            setBriefCity(city);
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
  }, [city, router]);

  return (
    <RequireAuth>
      <>
        <Topbar key={city} city={city} />
        <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 sm:p-6 lg:p-8">
          <DestinationHeader
            city={city}
            brief={briefCity === city ? brief : null}
            alertCount={(alerts?.length || 0) + (lockedAlerts || 0)}
          />

          {source && (
            <p className="text-xs text-[#a6a6ad]">
              {source === "cache"
                ? "Served from cache (under 24 hours)"
                : "Fresh scan"}
              {" · "}
              <Link
                href="/disclaimer"
                className="underline decoration-white/20 hover:text-white"
              >
                AI-generated. Not legal advice.
              </Link>
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <ScamAlerts
              alerts={alerts}
              loading={loading}
              plan={plan}
              lockedCount={lockedAlerts}
            />
            <InsiderTips
              tips={tips}
              loading={loading}
              city={city}
              plan={plan}
              lockedCount={lockedTips}
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
