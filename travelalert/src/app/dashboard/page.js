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
import { LiveTicker } from "@/components/dashboard/LiveTicker";
import { ThreatOverview } from "@/components/dashboard/ThreatOverview";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
import UpgradeModal from "@/components/UpgradeModal";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(() => searchParams.get("upgrade") === "true");

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
          "/api/briefing?city=" + encodeURIComponent(city) + (refresh ? "&refresh=1" : ""),
          { cache: "no-store", headers, signal: controller.signal },
        );

        if (res.status === 401) {
          router.replace("/login?city=" + encodeURIComponent(city));
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        // Never render a response for a different destination. This protects
        // against a slower request finishing after the user changes cities.
        if (String(data.city || "").trim().toLowerCase() !== requestedCity) {
          setError("The destination response did not match your search. Please try again.");
          return;
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

  // Load city brief data (weather, currency) - independent effect for faster loading
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const requestedCity = city.trim().toLowerCase();

    async function loadCityBrief() {
      // Check cache first
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
            // Cache the results
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

        {/* Live intel ticker â€” sits right under the topbar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="dashboard-frame mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-10"
        >
          <LiveTicker city={city} />
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

          {source && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-[#a6a6ad]"
            >
              {source === "cache"
                ? "Served from cache (under 24 hours)"
                : "Fresh scan"}
              {" Â· "}
              <Link
                href="/disclaimer"
                className="underline decoration-white/20 hover:text-white"
              >
                AI-generated. Not legal advice.
              </Link>
            </motion.p>
          )}

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
      fallback={<div className="p-8 text-[#a6a6ad]">Loading dashboardâ€¦</div>}
    >
      <DashboardContent />
    </Suspense>
  );
}
