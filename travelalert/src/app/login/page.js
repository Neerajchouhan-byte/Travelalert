"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "";
  const router = useRouter();

  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
    } else {
      // Step 16 — existing users log in here
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
    }

    // Step 17 — after success, go to dashboard with city
    const next = city
      ? "/dashboard?city=" + encodeURIComponent(city)
      : "/dashboard";
    router.push(next);
  }

  return (
    <main className="min-h-screen grid place-items-center p-6" style={{ background: "#060810", color: "#e2e8f0" }}>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <Link href="/" className="text-sm text-zinc-400">← Back</Link>
        <h1 className="mt-4 text-2xl font-bold">
          {mode === "signup" ? "Create account" : "Sign in"}
        </h1>
        <p className="mt-2 text-zinc-400">
          {city ? `We'll open ${city} after you sign in.` : "Sign in to scan destinations."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-full border border-white/20 bg-black/40 px-4 py-3 outline-none"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (8+)"
            className="w-full rounded-full border border-white/20 bg-black/40 px-4 py-3 outline-none"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-white py-3 font-semibold text-black disabled:opacity-50"
          >
            {busy ? "Working..." : mode === "signup" ? "Sign up" : "Log in"}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 text-sm text-zinc-400"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
        >
          {mode === "signup"
            ? "Already have an account? Log in"
            : "New here? Sign up"}
        </button>
      </div>
    </main>
  );
}