"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "";

  return (
    <main
      className="login-page"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "1.5rem",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div
        className="glass"
        style={{
          width: "100%",
          maxWidth: "28rem",
          borderRadius: "var(--r-xl)",
          padding: "2.2rem",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "0.83rem",
            fontWeight: 600,
            color: "var(--text-2)",
          }}
        >
          ← Back to TravelRadar
        </Link>

        <div
          className="hero-pill"
          style={{ marginTop: "1.25rem", marginBottom: "1.25rem" }}
        >
          <span className="live-dot"></span>
          {city ? `Destination ready: ${city}` : "Free account · No card needed"}
        </div>

        <h1
          style={{
            fontSize: "clamp(1.6rem, 3vw, 2rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: "0.5rem",
          }}
        >
          {city ? (
            <>
              Sign in to open{" "}
              <span className="grad">{city}</span>
            </>
          ) : (
            <>
              Welcome to <span className="grad">TravelRadar</span>
            </>
          )}
        </h1>

        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: "1.75rem",
          }}
        >
          {city
            ? "We'll load your scam briefing right after you sign in."
            : "Create an account to scan destinations before you land."}
        </p>

        {/* Form shell — Phase 4 fills real inputs + Supabase */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            type="email"
            placeholder="Email"
            className="s-input"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border)",
              borderRadius: "50px",
              padding: "0.85rem 1.2rem",
              color: "var(--text)",
              fontFamily: "inherit",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            className="s-input"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border)",
              borderRadius: "50px",
              padding: "0.85rem 1.2rem",
              color: "var(--text)",
              fontFamily: "inherit",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
          <button type="button" className="btn btn-accent btn-full btn-lg">
            Continue
          </button>
        </div>

        <p
          style={{
            marginTop: "1.25rem",
            textAlign: "center",
            fontSize: "0.8rem",
            color: "var(--text-3)",
          }}
        >
          Form wires to Supabase in Phase 4
        </p>
      </div>
    </main>
  );
}