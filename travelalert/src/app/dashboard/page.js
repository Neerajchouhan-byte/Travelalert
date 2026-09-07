"use client";
import { supabase } from "@/lib/supabase";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Topbar } from "@/components/dashboard/Topbar";
import { DestinationHeader } from "@/components/dashboard/DestinationHeader";
import { ScamAlerts } from "@/components/dashboard/ScamAlerts";
import { InsiderTips } from "@/components/dashboard/InsiderTips";
import { CurrencyCard } from "@/components/dashboard/CurrencyCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DestinationChips } from "@/components/dashboard/DestinationChips";
import { LiveTicker } from "@/components/dashboard/LiveTicker";
import { ThreatOverview } from "@/components/dashboard/ThreatOverview";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
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
  const [safety, setSafety] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);

  // Load briefing data (alerts, tips, safety) - independent effect
  useEffect(() => {
    let cancelled = false;

    async function loadBriefing() {
      // Check cache first
      const cacheKey = `briefing:${city.toLowerCase()}`;
      const cached = getCachedData(cacheKey);
      if (cached) {
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
        setSafety(data.safety || null);

        if (data.error && !(data.alerts || []).length) {
          setError(data.error);
        }

        // Cache the results
        setCachedData(cacheKey, data);
      } catch {
        if (!cancelled) setError("Could not load this destination");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBriefing();
    return () => {
      cancelled = true;
    };
  }, [city, router]);

  // Load city brief data (weather, currency) - independent effect for faster loading
  useEffect(() => {
    let cancelled = false;

    async function loadCityBrief() {
      // Check cache first
      const cacheKey = `citybrief:${city.toLowerCase()}`;
      const cached = getCachedData(cacheKey);
      if (cached) {
        setBrief(cached);
        setBriefCity(city);
        return;
      }

      setBriefLoading(true);

      try {
        const headers = await getAuthHeaders();

        const briefRes = await fetch(
          "/api/city-brief?city=" + encodeURIComponent(city),
          { cache: "no-store", headers },
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
        console.error("city brief load failed:", err);
      } finally {
        if (!cancelled) setBriefLoading(false);
      }
    }

    loadCityBrief();
    return () => {
      cancelled = true;
    };
  }, [city]);

  return (
    <RequireAuth>
      <>
        <Topbar key={city} city={city} />

        {/* Live intel ticker — sits right under the topbar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8"
        >
          <LiveTicker city={city} />
        </motion.div>

        <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 sm:p-6 lg:p-8">
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
              {" · "}
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

          <div className="grid gap-4 md:grid-cols-2">
            <ScamAlerts
              city={city}
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

          <div className="grid items-start gap-4 md:grid-cols-2">
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
