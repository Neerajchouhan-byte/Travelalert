"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ensureFreeProfile } from "@/lib/profile";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.7 0 2.9.7 3.5 1.3l2.4-2.3C16.4 3.7 14.4 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12S6.9 21.2 12 21.2c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.2-1.5H12z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-6.4L6.2 22H3.1l7.3-8.3L1 2h6.5l4.4 5.8L18.9 2zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20z"
      />
    </svg>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "";
  const router = useRouter();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const afterLogin = useMemo(() => {
    return city
      ? "/dashboard?city=" + encodeURIComponent(city)
      : "/dashboard";
  }, [city]);

  function oauthRedirect() {
    const origin = window.location.origin;
    const next = city
      ? `/auth/callback?city=${encodeURIComponent(city)}`
      : "/auth/callback";
    return origin + next;
  }

  async function handleOAuth(provider) {
    setError("");
    setMessage("");
    if (!supabase) {
      setError("Authentication is not configured yet.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: oauthRedirect(),
      },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      if (!supabase) {
        setError("Authentication is not configured yet.");
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
        if (data?.user && !data.session) {
          setMessage("Check your email to confirm your account, then sign in.");
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
      router.push(afterLogin);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setBusy(false);
    }
  }

  async function handleReset() {
    setError("");
    setMessage("");
    if (!supabase) {
      setError("Authentication is not configured yet.");
      return;
    }
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + "/login",
    });
    setBusy(false);
    if (error) setError(error.message);
    else setMessage("Check your email for the reset link.");
  }

  const isSignup = mode === "signup";

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#07070a] px-4 py-8 text-[#f3f3f2]">
      <div className="w-full max-w-[420px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e5484a]">
          {isSignup ? "Create account" : "Welcome back"}
        </p>
        <h1 className="mt-2 text-[1.85rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
          {isSignup ? "Create your briefing account." : "Sign in to your briefing."}
        </h1>
        <p className="mt-2 text-sm text-[#9a9aa3]">
          {city
            ? `We'll open ${city} after you sign in.`
            : "Search a city after you sign in."}
        </p>

        <div className="mt-7 space-y-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleOAuth("google")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-transparent text-sm font-semibold text-[#f3f3f2] transition hover:bg-white/[0.04] disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleOAuth("twitter")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-transparent text-sm font-semibold text-[#f3f3f2] transition hover:bg-white/[0.04] disabled:opacity-60"
          >
            <XIcon />
            Continue with X
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f6f78]">
            Or email
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="h-12 w-full rounded-full border border-white/12 bg-white/[0.04] px-5 text-sm text-[#f3f3f2] outline-none placeholder:text-[#6f6f78] focus:border-white/30"
          />
          <input
            type="password"
            required
            minLength={8}
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password · 8+ characters"
            className="h-12 w-full rounded-full border border-white/12 bg-white/[0.04] px-5 text-sm text-[#f3f3f2] outline-none placeholder:text-[#6f6f78] focus:border-white/30"
          />

          {error && <p className="px-1 text-sm text-[#fda4af]">{error}</p>}
          {message && <p className="px-1 text-sm text-emerald-300">{message}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#f3f3f2] text-sm font-semibold text-[#111] transition hover:bg-white disabled:opacity-60"
          >
            {busy ? "Working..." : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleReset}
          disabled={busy}
          className="mt-3 flex h-10 w-full items-center justify-center text-sm text-[#9a9aa3] hover:text-white"
        >
          Forgot password?
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(isSignup ? "login" : "signup");
            setError("");
            setMessage("");
          }}
          className="mt-1 flex h-10 w-full items-center justify-center text-sm text-[#9a9aa3] hover:text-white"
        >
          {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-svh place-items-center bg-[#07070a] text-[#9a9aa3]">
          Loading...
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}