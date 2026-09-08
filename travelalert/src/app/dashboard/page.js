"use client";
import { supabase } from "@/lib/supabase";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Topbar } from "@/components/dashboard/Topbar";
import { DestinationHeader } from "@/components/dashboard/DestinationHeader";
import { IntelTabs } from "@/components/dashboard/IntelTabs";
import { CurrencyCard } from "@/components/dashboard/CurrencyCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DestinationChips } from "@/components/dashboard/DestinationChips";
import { ThreatOverview } from "@/components/dashboard/ThreatOverview";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
import UpgradeModal from "@/components/UpgradeModal";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import {
  cities,
  getDestination,
  flagFromCountryCode,
} from "@/lib/dashboard-data";

// Simple in-memory cache for dashboard data to reduce latency on repeated views
const dashboardCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

// Helper to get auth headers
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
  const city = searchParams.get("city") || "Bangkok";
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
  // When returning from Dodo checkout with ?billing=success, activate Pro and unlock all cards
  useEffect(() => {
    if (searchParams.get("billing") === "success") {
      async function activatePro() {
        const { data } = await supabase?.auth.getSession();
        const token = data?.session?.access_token;
        if (!token) return;

        try {
          const res = await fetch("/api/billing/sync", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            setPlan("annual");
            setLockedAlerts(0);
            setLockedTips(0);
            // Clean up the URL query parameter without refreshing the page
            router.replace(`/dashboard?city=${encodeURIComponent(city)}`);
          }
        } catch (err) {
          console.error("[Dashboard] Activation error:", err);
        }
      }
      activatePro();
    }
  }, [searchParams, city, router]);

  // Triggers live scan, bypasses cache, and updates cache for all users
  async function handleRefresh() {
    if (refreshing || loading) return;
    setRefreshing(true);

    try {
      let headers = await getAuthHeaders();

      // Force live update via &refresh=1
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

        // Update local memory cache immediately
        setCachedData(`briefing:${city.trim().toLowerCase()}`, bData);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  }

  // Load briefing data (alerts, tips, safety) - independent effect
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const requestedCity = city.trim().toLowerCase();

    async function loadBriefing() {
      // Check cache first
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
        // Catch the 3-search limit reached
        if (res.status === 403) {
          const limitData = await res.json();
          setError(limitData.error);
          setShowUpgradeModal(true); // Automatically open the paywall modal
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        const resCity = String(data.city || "")
          .trim()
          .toLowerCase();
        if (
          resCity &&
          !resCity.includes(requestedCity) &&
          !requestedCity.includes(resCity)
        ) {
          console.warn("City mismatch:", { resCity, requestedCity });
        }

        setAlerts(data.alerts || []);
        setTips(data.tips || []);
        setSource(data.source || "");
        setPlan(data.plan || "free");
        setLockedAlerts(data.lockedAlerts || 0);
        setLockedTips(data.lockedTips || 0);
        setSafety(data.safety || null);

        if (data.error && !(data.alerts || []).length) {
          setError(data.error);
        }

        // Cache the results
        setCachedData(cacheKey, data);
      } catch (err) {
        if (!cancelled && err?.name !== "AbortError") {
          setError("Could not load this destination");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBriefing();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [city, refresh, router]);

  // Load city brief data (weather, currency)
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

  return (
    <RequireAuth>
      <>
        <Topbar key={city} city={city} />

        {/* Live intel ticker */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="dashboard-frame mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-10"
        >
          <DestinationChips active={city} />
        </motion.div>

        <div className="dashboard-frame mx-auto w-full max-w-7xl space-y-5 px-4 pb-10 pt-5 sm:px-6 sm:pb-14 lg:px-10 lg:pt-7">
          <DestinationHeader
            city={city}
            brief={briefCity === city ? brief : null}
            alertCount={(alerts?.length || 0) + (lockedAlerts || 0)}
            alerts={alerts}
            safety={safety}
          />

          {/* STATUS ROW WITH DEDICATED REFRESH BUTTON */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-2.5">
            <div className="text-xs text-[#a6a6ad]">
              <span
                className={
                  source === "cache" ? "text-[#3ecf8e]" : "text-[#f0a63d]"
                }
              >
                ●{" "}
                {source === "cache"
                  ? "Served from cache (instant)"
                  : "Live scan"}
              </span>
              {" · "}
              <Link
                href="/disclaimer"
                className="underline decoration-white/20 hover:text-white"
              >
                AI-organized Reddit intelligence
              </Link>
            </div>

            {/* THE REFRESH BUTTON */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-2 rounded-full border border-[#f0a63d]/30 bg-[#f0a63d]/10 px-3.5 py-1.5 text-xs font-semibold text-[#f0a63d] transition hover:border-[#f0a63d] hover:bg-[#f0a63d]/20 disabled:opacity-50"
            >
              <RefreshCw
                className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>
                {refreshing
                  ? "Scanning Reddit live..."
                  : "Refresh Intelligence"}
              </span>
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: [0, -6, 6, -3, 3, 0] }}
              transition={{ duration: 0.5 }}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </motion.p>
          )}

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

          <div className="dashboard-section-grid grid items-start gap-5 md:grid-cols-2">
            <CurrencyCard brief={briefCity === city ? brief : null} />
            <WeatherCard
              city={city}
              brief={briefCity === city ? brief : null}
            />
          </div>

          <ThreatOverview
            city={city}
            brief={briefCity === city ? brief : null}
            alerts={alerts}
            alertCount={(alerts?.length || 0) + (lockedAlerts || 0)}
            safety={safety}
          />

          <RecentActivity city={city} alerts={alerts} loading={loading} />
        </div>

        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          city={city}
        />
      </>
    </RequireAuth>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-[#a6a6ad]">Loading dashboard...</div>}
    >
      <DashboardContent />
    </Suspense>
  );
}
