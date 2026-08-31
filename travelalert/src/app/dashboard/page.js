"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AlertCard from "@/components/AlertCard";
import { FAKE_ALERTS } from "@/lib/fakeAlerts";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", background: "#0a0a0c", color: "#f3f3f2", display: "grid", placeItems: "center" }}>
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "Bangkok";
  const [query, setQuery] = useState("");

  const alerts = FAKE_ALERTS.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div className="search-wrap">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter alerts..."
            />
          </div>
          <div className="topbar-right">
            <span className="plan-pill">Free · 2 of 3 scans</span>
            <button className="notif-btn" type="button" aria-label="Notifications">
              <i className="fa-regular fa-bell"></i>
              <span className="notif-dot"></span>
            </button>
          </div>
        </header>

        <div className="page">
          <section className="panel dest-header">
            <div className="dest-left">
              <div className="dest-flag">🇹🇭</div>
              <div>
                <div className="dest-name">Results for {city}</div>
                <p className="eyebrow" style={{ marginTop: "0.4rem" }}>
                  <span className="live-dot"></span>
                  Static briefing — live Reddit in Phase 7
                </p>
              </div>
            </div>
          </section>

          <section className="scam-section" style={{ paddingTop: "1.5rem" }}>
            <div className="sec-header-center" style={{ marginBottom: "1.5rem" }}>
              <div className="sec-label">Scam briefing</div>
              <h2 className="sec-title">
                Active alerts for <span className="grad-red">{city}</span>
              </h2>
            </div>

            <div className="scam-grid">
              {alerts.map((a, i) => (
                <AlertCard key={i} {...a} />
              ))}
            </div>

            {alerts.length === 0 && (
              <p style={{ color: "#94a3b8", marginTop: "1rem" }}>
                No alerts match that filter.
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}