"use client";
import { ensureFreeProfile } from "@/lib/profile";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function LoginContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "";
  const router = useRouter();

  const [mode, setMode] = useState("signup"); // "signup" | "login"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      if (!supabase) {
        setError(
          "Authentication is not configured yet. Add your Supabase environment variables.",
        );
        setBusy(false);
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) {
          setError(error.message);
          setBusy(false);
          return;
        }
        // If email confirmation is ON in Supabase, user must confirm first
        if (data?.user && !data.session) {
          setMessage("Check your email to confirm your account, then log in.");
          setBusy(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setError(error.message);
          setBusy(false);
          return;
        }
      }
      await ensureFreeProfile(supabase);

      const next = city
        ? "/dashboard?city=" + encodeURIComponent(city)
        : "/dashboard";
      router.push(next);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#060810",
        color: "#e2e8f0",
        display: "grid",
        placeItems: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "28rem",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          padding: "2rem",
        }}
      >
        <Link href="/" style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
          ← Back
        </Link>

        <h1
          style={{
            marginTop: "1rem",
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          {mode === "signup" ? "Create account" : "Sign in"}
        </h1>

        <p
          style={{ marginTop: "0.5rem", color: "#94a3b8", fontSize: "0.95rem" }}
        >
          {city
            ? `City waiting: ${city}`
            : "Start free. Scan destinations in seconds."}
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: "1.75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#94a3b8",
              marginBottom: "0.35rem",
            }}
          >
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={{
              width: "100%",
              borderRadius: "50px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "#e2e8f0",
              padding: "0.85rem 1.2rem",
              marginBottom: "1rem",
              outline: "none",
              fontFamily: "inherit",
              fontSize: "0.9rem",
            }}
          />

          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#94a3b8",
              marginBottom: "0.35rem",
            }}
          >
            Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            style={{
              width: "100%",
              borderRadius: "50px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "#e2e8f0",
              padding: "0.85rem 1.2rem",
              marginBottom: "1rem",
              outline: "none",
              fontFamily: "inherit",
              fontSize: "0.9rem",
            }}
          />

          {error && (
            <p
              style={{
                color: "#fda4af",
                fontSize: "0.85rem",
                marginBottom: "0.75rem",
              }}
            >
              {error}
            </p>
          )}
          {message && (
            <p
              style={{
                color: "#6ee7b7",
                fontSize: "0.85rem",
                marginBottom: "0.75rem",
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              width: "100%",
              borderRadius: "50px",
              border: "none",
              padding: "0.9rem 1.5rem",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "white",
              fontFamily: "inherit",
            }}
          >
            {busy
              ? "Working..."
              : mode === "signup"
                ? "Sign up free"
                : "Log in"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signup" ? "login" : "signup");
            setError("");
            setMessage("");
          }}
          style={{
            marginTop: "1.25rem",
            background: "none",
            border: "none",
            color: "#94a3b8",
            fontSize: "0.85rem",
            cursor: "pointer",
            fontFamily: "inherit",
            width: "100%",
            textAlign: "center",
          }}
        >
          {mode === "signup"
            ? "Already have an account? Log in"
            : "New here? Create account"}
        </button>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            background: "#060810",
            color: "#e2e8f0",
            display: "grid",
            placeItems: "center",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "28rem",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            Loading...
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
