"use client";

import { supabase } from "@/lib/supabase";
import { Suspense, useEffect, useRef, useState } from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { DestinationChips } from "@/components/dashboard/DestinationChips";
import { DestinationHeader } from "@/components/dashboard/DestinationHeader";
import { TripModeCard } from "@/components/dashboard/TripModeCard";
import { AddToTripButton } from "@/components/dashboard/AddToTripButton";
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

function capForPlan(plan, alerts = [], tips = []) {
  if (plan !== "free") {
    return { alerts, tips, lockedAlerts: 0, lockedTips: 0 };
  }
  const visibleAlerts = Math.min(2, alerts.length);
  const visibleTips = Math.min(3, tips.length);
  return {
    alerts: alerts.slice(0, Math.max(2, visibleAlerts)),
    tips: tips.slice(0, Math.max(3, visibleTips)),
    lockedAlerts: Math.max(0, alerts.length - Math.max(2, visibleAlerts)),
    lockedTips: Math.max(0, tips.length - Math.max(3, visibleTips)),
  };
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
  const cachedOnly = searchParams.get("cached_only") === "1";
  const router = useRouter();

  const [alerts, setAlerts] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [brief, setBrief] = useState(null);
  const [briefCity, setBriefCity] = useState("");
  const [briefingCity, setBriefingCity] = useState("");
  const [plan, setPlan] = useState("free");
  const [lockedAlerts, setLockedAlerts] = useState(0);
  const [lockedTips, setLockedTips] = useState(0);
  const [safety, setSafety] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);

  const upgradeParam = searchParams.get("upgrade");
  const [showUpgradeModal, setShowUpgradeModal] = useState(
    () => upgradeParam === "true" || upgradeParam === "trip_mode",
  );
  const [upgradeReason, setUpgradeReason] = useState(
    () => (upgradeParam === "trip_mode" ? "trip_mode" : null),
  );

  function openUpgrade(reason = null) {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  }

  const [refreshing, setRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState("");
  const [searchesLeft, setSearchesLeft] = useState(null);
  const [searchLimit, setSearchLimit] = useState(null);
  const [noData, setNoData] = useState(false);

  const requestIdRef = useRef(0);

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
    setRefreshNotice("");

    const reqId = ++requestIdRef.current;

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `/api/briefing?city=${encodeURIComponent(city)}&refresh=1`,
        { headers, cache: "no-store" },
      );

      if (reqId !== requestIdRef.current) return;

      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        if (data.limitReached) {
          openUpgrade();
          setSearchesLeft(0);
        }
        return;
      }

      if (res.ok) {
        const bData = await res.json();
        const effectivePlan = bData.plan || "free";
        const capped = capForPlan(
          effectivePlan,
          bData.alerts || [],
          bData.tips || [],
        );

        setAlerts(capped.alerts);
        setTips(capped.tips);
        setLockedAlerts(
          bData.lockedAlerts != null ? bData.lockedAlerts : capped.lockedAlerts,
        );
        setLockedTips(
          bData.lockedTips != null ? bData.lockedTips : capped.lockedTips,
        );
        setPlan(effectivePlan);
        setSource(bData.source || "live");
        setNoData(Boolean(bData.noData));
        setSafety(bData.safety != null ? String(bData.safety) : null);
        if (bData.searchesLeft !== undefined) setSearchesLeft(bData.searchesLeft);
        if (bData.searchLimit !== undefined) setSearchLimit(bData.searchLimit);
        setBriefingCity(city);

        if (bData.refreshBlocked) {
          setRefreshNotice(bData.refreshBlockedReason || "Refresh blocked.");
        } else if (bData.searchesLeft != null && bData.searchesLeft > 0) {
          setRefreshNotice(
            `${bData.searchesLeft} of ${bData.searchLimit} free ${
              bData.searchesLeft === 1 ? "search" : "searches"
            } remaining this month`,
          );
        } else if (bData.searchesLeft === 0) {
          setRefreshNotice(
            "That was your last free search this month. Upgrade for unlimited access.",
          );
        }
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
    const reqId = ++requestIdRef.current;

    async function loadBriefing() {
      setLoading(true);
      setError("");
      setRefreshNotice("");
      setAlerts([]);
      setTips([]);
      setSafety(null);
      setSource("");
      setNoData(false);

      try {
        const headers = await getAuthHeaders();
        const params = new URLSearchParams();
        params.set("city", city);
        if (refresh) params.set("refresh", "1");
        if (cachedOnly) params.set("cached_only", "1");

        const res = await fetch("/api/briefing?" + params.toString(), {
          cache: "no-store",
          headers,
          signal: controller.signal,
        });

        if (cancelled) return;
        if (reqId !== requestIdRef.current) return;

        if (res.status === 401) {
          router.replace("/login?city=" + encodeURIComponent(city));
          return;
        }

        const data = await res.json();

        if (cancelled || reqId !== requestIdRef.current) return;

        if (res.status === 403 && data.limitReached) {
          setSearchesLeft(0);
          openUpgrade();
          setError("");
          setNoData(true);
          setBriefingCity(city);
          return;
        }

        const effectivePlan = data.plan || "free";
        const capped = capForPlan(
          effectivePlan,
          data.alerts || [],
          data.tips || [],
        );

        setAlerts(capped.alerts);
        setTips(capped.tips);
        setLockedAlerts(
          data.lockedAlerts != null ? data.lockedAlerts : capped.lockedAlerts,
        );
        setLockedTips(
          data.lockedTips != null ? data.lockedTips : capped.lockedTips,
        );
        setSource(data.source || "");
        setPlan(effectivePlan);
        setSafety(data.safety != null ? String(data.safety) : null);
        setNoData(Boolean(data.noData));
        if (data.searchesLeft !== undefined) setSearchesLeft(data.searchesLeft);
        if (data.searchLimit !== undefined) setSearchLimit(data.searchLimit);
        setBriefingCity(city);

        if (data.limitReached) {
          openUpgrade();
          setError("");
        } else if (data.error && !(data.alerts || []).length) {
          setError(data.error);
        }

        if (data.refreshBlocked) {
          setRefreshNotice(data.refreshBlockedReason || "");
        }
      } catch (err) {
        if (!cancelled && err?.name !== "AbortError") {
          console.error("Briefing load failed:", err);
          setError("Could not load this destination");
        }
      } finally {
        if (!cancelled) setLoading(false);
        if (!cancelled && refresh) {
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
  }, [city, refresh, cachedOnly, router, searchParams]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadCityBrief() {
      setBrief(null);
      setBriefCity("");
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
  const searchLocked =
    plan === "free" && searchesLeft !== null && searchesLeft <= 0;
  const refreshLocked = searchLocked;

  const showBriefing = briefingCity === city;
  const renderAlerts = showBriefing ? alerts : [];
  const renderTips = showBriefing ? tips : [];
  const renderSource = showBriefing ? source : "";
  const renderSafety = showBriefing ? safety : null;
  const renderNoData = showBriefing ? noData : false;
  const renderLockedAlerts = showBriefing ? lockedAlerts : 0;
  const renderLockedTips = showBriefing ? lockedTips : 0;
  const renderLoading = !showBriefing && !error;

  const addToTripSlot = (
    <AddToTripButton
      city={city}
      plan={plan}
      onUpgrade={() => openUpgrade("trip_mode")}
    />
  );

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#f7f6f2] pb-16 text-zinc-900 transition-colors duration-200 dark:bg-[#0c0c0e] dark:text-[#f3f3f2]">
        <Topbar
          key={city}
          city={city}
          brief={activeBrief}
          searchLocked={searchLocked}
        />

        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
          <DestinationChips active={city} />

          {renderSource && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {renderSource === "cache"
                ? "Cached briefing"
                : renderSource === "empty"
                  ? "No intel yet for this destination"
                  : renderSource === "seed"
                    ? "Pre-loaded preview"
                    : "Live intelligence"}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {error}
            </p>
          )}

          {refreshNotice && (
            <p className="mt-3 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
              {refreshNotice}
            </p>
          )}

          {/* DESKTOP (xl+) */}
          <div className="mt-5 hidden gap-5 xl:grid xl:grid-cols-[1.35fr_1fr_1fr] items-start">
            <div className="space-y-5">
              <DestinationHeader
                city={city}
                brief={activeBrief}
                alerts={renderAlerts}
                safety={renderSafety}
                actionSlot={addToTripSlot}
              />
              <TripModeCard
                plan={plan}
                onUpgrade={() => openUpgrade("trip_mode")}
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

            <div className="xl:col-span-3">
              <IntelTabs
                key={city}
                city={city}
                alerts={renderAlerts}
                tips={renderTips}
                loading={renderLoading}
                plan={plan}
                lockedAlerts={renderLockedAlerts}
                lockedTips={renderLockedTips}
                noData={renderNoData}
                onUpgrade={() => openUpgrade()}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                refreshLocked={refreshLocked}
              />
            </div>
          </div>

          {/* TABLET 2-COLUMN */}
          <div className="mt-5 hidden gap-5 md:grid md:grid-cols-2 xl:hidden items-start">
            <div className="space-y-5">
              <DestinationHeader
                city={city}
                brief={activeBrief}
                alerts={renderAlerts}
                safety={renderSafety}
                actionSlot={addToTripSlot}
              />
              <TripModeCard
                plan={plan}
                onUpgrade={() => openUpgrade("trip_mode")}
              />
              <IntelTabs
                key={city}
                city={city}
                alerts={renderAlerts}
                tips={renderTips}
                loading={renderLoading}
                plan={plan}
                lockedAlerts={renderLockedAlerts}
                lockedTips={renderLockedTips}
                noData={renderNoData}
                onUpgrade={() => openUpgrade()}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                refreshLocked={refreshLocked}
              />
            </div>

            <div className="space-y-5">
              <Weather7DayCard brief={activeBrief} />
              <WeatherNowCard brief={activeBrief} />
              <UsdConversionCard brief={activeBrief} />
              <ExchangeRateCard brief={activeBrief} />
            </div>
          </div>

          {/* MOBILE STACKED */}
          <div className="mt-5 space-y-5 md:hidden">
            <DestinationHeader
              city={city}
              brief={activeBrief}
              alerts={renderAlerts}
              safety={renderSafety}
              actionSlot={addToTripSlot}
            />

            <TripModeCard
              plan={plan}
              onUpgrade={() => openUpgrade("trip_mode")}
            />

            <IntelTabs
              key={city}
              city={city}
              alerts={renderAlerts}
              tips={renderTips}
              loading={renderLoading}
              plan={plan}
              lockedAlerts={renderLockedAlerts}
              lockedTips={renderLockedTips}
              noData={renderNoData}
              onUpgrade={() => openUpgrade()}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              refreshLocked={refreshLocked}
            />

            <Weather7DayCard brief={activeBrief} />

            <div className="grid grid-cols-2 gap-3">
              <WeatherNowCard brief={activeBrief} />
              <UsdConversionCard brief={activeBrief} />
            </div>

            <ExchangeRateCard brief={activeBrief} />
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          city={city}
          highlight={upgradeReason}
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