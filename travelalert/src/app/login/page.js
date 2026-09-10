"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Radar, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ensureFreeProfile } from "@/lib/profile";

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0 mr-2.5"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0 mr-2.5 fill-current"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "";
  const redirect = searchParams.get("redirect") || "";
  const router = useRouter();

  const [mode, setMode] = useState(() =>
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
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
  const destinationCity = city || "Bangkok";

  const afterLogin = useMemo(() => {
    const target =
      redirect.startsWith("/") && !redirect.startsWith("//")
        ? redirect
        : "/dashboard";
    const destination = new URL(target, "https://travelradar.local");
    if (city) destination.searchParams.set("city", city);
    return destination.pathname + (destination.search ? destination.search : "");
  }, [city, redirect]);

  async function handleGoogleAuth() {
    setError("");
    setMessage("");
    if (!supabase) return setError("Authentication is not configured.");
    setBusy(true);
    try {
      const origin = window.location.origin;
      const callback = new URL("/auth/callback", origin);
      if (city) callback.searchParams.set("city", city);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
      });
      if (error) throw error;
    } catch (err) {
      console.error("[Auth] Google sign-in failed:", err);
      setError(err?.message || "Google sign-in could not be started.");
      setBusy(false);
    }
  }

  async function handleTwitterAuth() {
    setError("");
    setMessage("");
    if (!supabase) {
      setError("Authentication is not configured.");
      return;
    }

    setBusy(true);
    try {
      const origin = window.location.origin;
      const callback = new URL("/auth/callback", origin);
      if (city) callback.searchParams.set("city", city);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: callback.toString(),
          // X's OAuth 2.0 requires these scopes to fetch the user's email and
          // profile. Supabase requests them by default, but listing them here
          // makes the intent explicit and matches X's developer portal config.
          scopes: "users.read tweet.read",
        },
      });

      if (error) {
        // Most common errors from Supabase for this provider:
        //   - "Unsupported provider: provider is not enabled"
        //     → Twitter provider isn't turned on in Supabase Auth settings.
        //   - "Invalid redirect URL" / "Redirect URL not allowed"
        //     → the app's /auth/callback URL isn't in Supabase's Redirect URLs list.
        console.error("[Auth] X sign-in failed:", error);
        throw error;
      }

      // The browser client auto-redirects on success, so this only fires if
      // Supabase returned a URL without redirecting (e.g., a fetch/SSR client
      // was used by mistake). Falling back to manual navigation keeps the flow
      // working instead of leaving the button stuck on "Working...".
      if (data?.url && typeof window !== "undefined") {
        window.location.assign(data.url);
        return;
      }

      // If neither the SDK redirect nor a manual fallback happened, reset and
      // surface a clear message so the user is not stuck on a disabled button.
      setBusy(false);
      setError("X sign-in could not be started. Please try again.");
    } catch (err) {
      console.error("[Auth] X sign-in threw:", err);
      setError(err?.message || "X sign-in could not be started.");
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
    <main className="min-h-screen bg-[#f7f6f2] text-zinc-900 transition-colors duration-200 dark:bg-[#0c0c0e] dark:text-[#f3f3f2]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:grid lg:grid-cols-12">

        {/* Left Hero Column (Desktop/Tablet) */}
        <div className="hidden flex-col justify-between p-8 sm:p-12 lg:col-span-6 lg:flex lg:p-16">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#e5283b] text-white">
              <Radar className="size-4" />
            </span>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              TravelRadar
            </span>
          </Link>

          {/* Large Hero Statement */}
          <div className="my-auto pt-16">
            <h2 className="text-5xl font-black tracking-tight text-zinc-900 leading-[1.06] sm:text-6xl lg:text-[68px] dark:text-white">
              Know before <br />
              you go.
            </h2>
            <p className="mt-5 max-w-sm text-base text-zinc-500 sm:text-lg dark:text-zinc-400">
              Real-time safety intelligence for every destination.
            </p>
          </div>

          <div />
        </div>

        {/* Right Auth Column (Desktop & Mobile) */}
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:col-span-6 lg:p-16">
          <div className="w-full max-w-[420px]">

            {/* Header copy */}
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#e5283b] dark:text-[#f87171]">
                {isSignup ? "GET STARTED" : "WELCOME BACK"}
              </span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
                {isSignup ? "Create your account." : "Sign in to your briefing."}
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                We&apos;ll open {destinationCity} after you {isSignup ? "sign up" : "sign in"}.
              </p>
            </div>

            {/* Social Buttons */}
            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={busy}
                className="flex h-12 w-full items-center justify-center rounded-full border border-zinc-200/90 bg-white text-xs font-bold text-zinc-900 shadow-2xs transition-colors hover:bg-zinc-50 disabled:opacity-60 sm:text-sm dark:border-white/10 dark:bg-[#16161b] dark:text-white dark:hover:bg-white/5"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleTwitterAuth}
                disabled={busy}
                className="flex h-12 w-full items-center justify-center rounded-full border border-zinc-200/90 bg-white text-xs font-bold text-zinc-900 shadow-2xs transition-colors hover:bg-zinc-50 disabled:opacity-60 sm:text-sm dark:border-white/10 dark:bg-[#16161b] dark:text-white dark:hover:bg-white/5"
              >
                <XIcon />
                <span>Continue with X</span>
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3 text-center">
              <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                OR EMAIL
              </span>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {isSignup && (
                <div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="h-12 w-full rounded-full border border-zinc-200/90 bg-white px-5 text-sm text-zinc-900 shadow-2xs outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-white/10 dark:bg-[#16161b] dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/30"
                  />
                </div>
              )}

              <div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="h-12 w-full rounded-full border border-zinc-200/90 bg-white px-5 text-sm text-zinc-900 shadow-2xs outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-white/10 dark:bg-[#16161b] dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/30"
                />
              </div>

              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password · 8+ characters"
                  className="h-12 w-full rounded-full border border-zinc-200/90 bg-white pl-5 pr-11 text-sm text-zinc-900 shadow-2xs outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-white/10 dark:bg-[#16161b] dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-zinc-400 hover:text-zinc-600 transition dark:hover:text-zinc-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {!isSignup && (
                <div className="flex items-center justify-between px-2 pt-0.5 text-xs">
                  <label className="flex cursor-pointer items-center gap-2 select-none text-zinc-500 dark:text-zinc-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-3.5 rounded accent-[#e5283b]"
                    />
                    <span className="text-xs">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {message}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={busy}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold text-white shadow-md transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-60 dark:border dark:border-white/20 dark:bg-black dark:hover:bg-zinc-900 cursor-pointer"
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="size-4 animate-spin text-white" />
                    <span>Working...</span>
                  </span>
                ) : isSignup ? (
                  "Create account"
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Mode Switcher */}
            <div className="mt-5 text-center text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
              <span>{isSignup ? "Already have an account? " : "New here? "}</span>
              <button
                type="button"
                onClick={() => {
                  setMode(isSignup ? "login" : "signup");
                  setError("");
                  setMessage("");
                }}
                className="font-bold text-[#e5283b] transition hover:underline dark:text-[#f87171]"
              >
                {isSignup ? "Sign in" : "Create an account"}
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f7f6f2] dark:bg-[#0c0c0e]" />}>
      <LoginContent />
    </Suspense>
  );
}