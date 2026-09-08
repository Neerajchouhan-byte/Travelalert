"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Radar, Eye, EyeOff, ChevronLeft, LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ensureFreeProfile } from "@/lib/profile";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.7 0 2.9.7 3.5 1.3l2.4-2.3C16.4 3.7 14.4 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12S6.9 21.2 12 21.2c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.2-1.5H12z" />
    </svg>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "";
  const redirect = searchParams.get("redirect") || "";
  const router = useRouter();

  const [mode, setMode] = useState(() => searchParams.get("mode") === "signup" ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  const afterLogin = useMemo(() => {
    const target = redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/dashboard";
    const destination = new URL(target, "https://travelradar.local");
    if (city) destination.searchParams.set("city", city);
    return destination.pathname + (destination.search ? destination.search : "");
  }, [city, redirect]);

  async function handleGoogleAuth() {
    setError("");
    setMessage("");
    if (!supabase) return setError("Authentication is not configured.");
    setBusy(true);
    const origin = window.location.origin;
    const callback = new URL("/auth/callback", origin);
    if (city) callback.searchParams.set("city", city);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
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
      if (!supabase) throw new Error("Authentication not configured.");

      if (isSignup) {
        if (!agreeTerms) {
          throw new Error("Please agree to the Terms of Service to continue.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              display_name: name.trim(),
            },
          },
        });

        if (error) throw error;
        if (data?.user && !data.session) {
          setMessage("Confirmation link sent! Check your inbox, then log in.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }

      await ensureFreeProfile(supabase);
      router.refresh();
      router.push(afterLogin);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    setError("");
    setMessage("");
    if (!supabase) return setError("Authentication is not configured.");
    if (!email.trim()) return setError("Please enter your email address first.");

    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + "/login",
    });
    setBusy(false);
    if (error) setError(error.message);
    else setMessage("Password reset email sent. Check your inbox.");
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#07070a] p-4 py-8 text-[#f3f3f2]">
      
      <div className="w-full max-w-[390px]">

        {/* 1. Header with Circular Back Button & Centered Logo */}
        <div className="relative mb-5 flex items-center justify-center">
          <button
            type="button"
            onClick={() => (isSignup ? setMode("login") : router.push("/"))}
            className="absolute left-0 flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#121216] text-[#a6a6ad] transition hover:border-white/25 hover:text-white active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#e5484a] text-white">
              <Radar className="size-4" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              TravelRadar
            </span>
          </div>
        </div>

        {/* 2. Main Card Layout */}
        <div className="rounded-[28px] border border-white/10 bg-[#121216] p-6 sm:p-7 shadow-2xl shadow-black/80">
          
          {/* Title */}
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl leading-snug">
            {isSignup ? "Create an Account?" : "Welcome to TravelRadar login now!"}
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            
            {/* Name Field (Only on Signup) */}
            {isSignup && (
              <div>
                <label className="mb-1 block text-[11px] font-medium text-[#8e8e98]">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Johan orindo"
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#1a1a22] px-4 text-xs text-white placeholder:text-[#555560] outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition"
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#8e8e98]">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joedoe75@gmail.com"
                className="h-11 w-full rounded-xl border border-white/10 bg-[#1a1a22] px-4 text-xs text-white placeholder:text-[#555560] outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-[#8e8e98]">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#1a1a22] pl-4 pr-10 text-xs text-white placeholder:text-[#555560] outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#757580] hover:text-white transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Terms Agreement (Signup) OR Remember Me & Forgot Password (Login) */}
            {isSignup ? (
              <div className="flex items-center gap-2 pt-0.5 text-xs text-[#8e8e98]">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="size-3.5 rounded accent-[#e5484a] cursor-pointer"
                />
                <label htmlFor="terms" className="cursor-pointer select-none text-[11px]">
                  I agree to the{" "}
                  <Link href="/terms" className="text-[#5b9dee] hover:underline">
                    Terms of Service
                  </Link>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <label className="flex cursor-pointer items-center gap-2 select-none text-[#8e8e98]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-3.5 rounded accent-[#e5484a]"
                  />
                  <span className="text-[11px]">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] font-medium text-[#5b9dee] hover:underline"
                >
                  Forget password?
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                {message}
              </div>
            )}

            {/* White Pill Submit Button */}
            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-white text-xs font-bold text-black shadow-md shadow-white/10 transition hover:bg-[#eaeaea] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin text-black" />
                  <span>Working...</span>
                </span>
              ) : isSignup ? (
                "Create account"
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-5 text-center">
            <span className="text-[11px] text-[#686875]">Or Sign in with</span>
          </div>

          {/* Single Google Social Button */}
          <div className="mt-3 flex items-center justify-center">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={busy}
              className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-[#1a1a22] transition hover:border-white/20 hover:bg-[#22222c] active:scale-95 shadow-sm disabled:opacity-50"
              aria-label="Sign in with Google"
            >
              <GoogleIcon />
            </button>
          </div>

          {/* Bottom Mode Switcher */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(isSignup ? "login" : "signup");
                setError("");
                setMessage("");
              }}
              className="text-[11px] text-[#8e8e98] hover:text-white transition"
            >
              {isSignup
                ? "Already have an account? Login"
                : "Don't have an account? Create an Account"}
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#07070a]" />}>
      <LoginContent />
    </Suspense>
  );
}