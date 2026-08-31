"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#0a0a0c] text-zinc-200">
          Loading...
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "Bangkok";
  const router = useRouter();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    if (!supabase) {
      setError("Authentication is not configured yet. Add your Supabase env vars.");
      setBusy(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          setBusy(false);
          return;
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          setError(loginError.message);
          setBusy(false);
          return;
        }
      }

      const next = city ? "/dashboard?city=" + encodeURIComponent(city) : "/dashboard";
      router.push(next);
    } catch (submitError) {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
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