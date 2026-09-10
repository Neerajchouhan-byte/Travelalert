"use client";

import { supabase } from "@/lib/supabase";
import { Suspense, useEffect, useState } from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { DestinationChips } from "@/components/dashboard/DestinationChips";
import { DestinationHeader } from "@/components/dashboard/DestinationHeader";
import { IntelTabs } from "@/components/dashboard/IntelTabs";
import {
  Weather7DayCard,
  WeatherNowCard,
} from "@/components/dashboard/WeatherCard";
import {
  UsdConversionCard,
  ExchangeRateCard,
} from "@/components/dashboard/CurrencyCard";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
import UpgradeModal from "@/components/UpgradeModal";
import { useRouter, useSearchParams } from "next/navigation";

const dashboardCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

// Prevent cross-user cache leakage: drop every cached briefing when the
// signed-in user changes (sign-out). The next sign-in on this browser then
// starts with an empty cache and cannot read the previous user's plan,
// locked-alert counts, or alerts.
if (supabase) {
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      dashboardCache.clear();
    }
  });
}

function getCachedData(key) {
  const cached = dashboardCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(key, data) {
  dashboardCache.set(key, { data, timestamp: Date.now() });
}

async function getAuthHeaders() {
  let headers = {};
  if (supabase) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (token) headers = { Authorization: "Bearer " + token };
  }
  return headers;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "Bali";
  const refresh = searchParams.get("refresh") === "1";
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
  const [safety, setSafety] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(
    () => searchParams.get("upgrade") === "true",
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (searchParams.get("billing") !== "success") return;

    async function activatePro() {
      const { data } = await supabase?.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) return;

      async function syncOnce() {
        return fetch("/api/billing/sync", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      try {
        let res = await syncOnce();
        if (res.status === 202) {
          await new Promise((r) => setTimeout(r, 2000));
          res = await syncOnce();
        }
        if (res.ok) {
          const body = await res.json().catch(() => ({}));
          if (body.plan) {
            setPlan(body.plan);
            setLockedAlerts(0);
            setLockedTips(0);
          }
        }
      } catch (err) {
        console.error("[Dashboard] Activation error:", err);
      } finally {
        router.replace(
          `/dashboard?city=${encodeURIComponent(city)}&refresh=1`,
        );
      }
    }

    activatePro();
  }, [searchParams, city, router]);

  async function handleRefresh() {
    if (refreshing || loading) return;
    setRefreshing(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `/api/briefing?city=${encodeURIComponent(city)}&refresh=1`,
        { headers, cache: "no-store" },
      );

      if (res.ok) {
        const bData = await res.json();
        setAlerts(bData.alerts || []);
        setTips(bData.tips || []);
        setLockedAlerts(bData.lockedAlerts || 0);
        setLockedTips(bData.lockedTips || 0);
        setPlan(bData.plan || "free");
        setSource("live");
        if (bData.safety) setSafety(String(bData.safety));

        setCachedData(`briefing:${city.trim().toLowerCase()}`, bData);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const requestedCity = city.trim().toLowerCase();

    async function loadBriefing() {
      const cacheKey = `briefing:${requestedCity}`;
      const cached = getCachedData(cacheKey);
      if (cached && !refresh) {
        if (cancelled) return;
        setAlerts(cached.alerts || []);
        setTips(cached.tips || []);
        setSource(cached.source || "");
        setPlan(cached.plan || "free");
        setLockedAlerts(cached.lockedAlerts || 0);
        setLockedTips(cached.lockedTips || 0);
        setSafety(cached.safety || null);
        return;
      }

      setLoading(true);
      setError("");
      setAlerts([]);
      setTips([]);
      setSource("");
      setSafety(null);

      try {
        const headers = await getAuthHeaders();
        const res = await fetch(
          "/api/briefing?city=" +
            encodeURIComponent(city) +
            (refresh ? "&refresh=1" : ""),
          { cache: "no-store", headers, signal: controller.signal },
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
        setSafety(data.safety || null);

        if (data.limitReached) {
          setShowUpgradeModal(true);
          setError("");
        } else if (data.error && !(data.alerts || []).length) {
          setError(data.error);
        }

        setCachedData(cacheKey, data);
      } catch (err) {
        if (!cancelled && err?.name !== "AbortError") {
          setError("Could not load this destination");
        }
      } finally {
        if (!cancelled) setLoading(false);
        if (!cancelled && refresh) {
          // Strip ?refresh=1 so a reload, bookmark, or shared link does not
          // keep forcing a fresh scrape. Preserve every other query param.
          const params = new URLSearchParams(searchParams.toString());
          params.delete("refresh");
          const qs = params.toString();
          router.replace(qs ? `/dashboard?${qs}` : "/dashboard");
        }
      }
    }

    loadBriefing();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [city, refresh, router, searchParams]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const requestedCity = city.trim().toLowerCase();

    async function loadCityBrief() {
      const cacheKey = `citybrief:${requestedCity}`;
      const cached = getCachedData(cacheKey);
      if (cached) {
        if (cancelled) return;
        setBrief(cached);
        setBriefCity(city);
        return;
      }

      setBriefLoading(true);
      try {
        const headers = await getAuthHeaders();
        const briefRes = await fetch(
          "/api/city-brief?city=" + encodeURIComponent(city),
          { cache: "no-store", headers, signal: controller.signal },
        );

        if (briefRes.ok) {
          const briefData = await briefRes.json();
          if (!cancelled) {
            setBrief(briefData);
            setBriefCity(city);
            setCachedData(cacheKey, briefData);
          }
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("city brief load failed:", err);
        }
      } finally {
        if (!cancelled) setBriefLoading(false);
      }
    }

    loadCityBrief();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [city]);

  const activeBrief = briefCity === city ? brief : null;

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#f7f6f2] pb-16 text-zinc-900 transition-colors duration-200 dark:bg-[#0c0c0e] dark:text-[#f3f3f2]">
        <Topbar key={city} city={city} brief={activeBrief} />

        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
          <DestinationChips active={city} />

          {error && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {error}
            </p>
          )}

          {/* 1. DESKTOP 3-COLUMN LAYOUT */}
          <div className="mt-5 hidden gap-5 xl:grid xl:grid-cols-[1.35fr_1fr_1fr]">
            <div className="space-y-5">
              <DestinationHeader
                city={city}
                brief={activeBrief}
                alerts={alerts}
                safety={safety}
              />
              <IntelTabs
                city={city}
                alerts={alerts}
                tips={tips}
                loading={loading}
                plan={plan}
                lockedAlerts={lockedAlerts}
                lockedTips={lockedTips}
                onUpgrade={() => setShowUpgradeModal(true)}
              />
            </div>

            <div className="space-y-5">
              <Weather7DayCard brief={activeBrief} />
              <WeatherNowCard brief={activeBrief} />
            </div>

            <div className="space-y-5">
              <UsdConversionCard brief={activeBrief} />
              <ExchangeRateCard brief={activeBrief} />
            </div>
          </div>

          {/* 2. TABLET 2-COLUMN LAYOUT */}
          <div className="mt-5 hidden gap-5 md:grid md:grid-cols-2 xl:hidden">
            <div className="space-y-5">
              <DestinationHeader
                city={city}
                brief={activeBrief}
                alerts={alerts}
                safety={safety}
              />
              <IntelTabs
                city={city}
                alerts={alerts}
                tips={tips}
                loading={loading}
                plan={plan}
                lockedAlerts={lockedAlerts}
                lockedTips={lockedTips}
                onUpgrade={() => setShowUpgradeModal(true)}
              />
            </div>

            <div className="space-y-5">
              <Weather7DayCard brief={activeBrief} />
              <WeatherNowCard brief={activeBrief} />
              <UsdConversionCard brief={activeBrief} />
              <ExchangeRateCard brief={activeBrief} />
            </div>
          </div>

          {/* 3. MOBILE STACKED LAYOUT */}
          <div className="mt-5 space-y-5 md:hidden">
            <DestinationHeader
              city={city}
              brief={activeBrief}
              alerts={alerts}
              safety={safety}
            />

            <Weather7DayCard brief={activeBrief} />

            <div className="grid grid-cols-2 gap-3">
              <WeatherNowCard brief={activeBrief} />
              <UsdConversionCard brief={activeBrief} />
            </div>

            <ExchangeRateCard brief={activeBrief} />

            <IntelTabs
              city={city}
              alerts={alerts}
              tips={tips}
              loading={loading}
              plan={plan}
              lockedAlerts={lockedAlerts}
              lockedTips={lockedTips}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          city={city}
        />
      </div>
    </RequireAuth>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-8 text-sm text-zinc-500">
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}