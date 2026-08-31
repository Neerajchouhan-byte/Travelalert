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
    <div
      className="relative size-full min-h-screen"
      style={{ background: "#0a0a0c", fontFamily: "Inter, sans-serif" }}
    >
      <p
        className="absolute font-bold text-[18px] whitespace-nowrap"
        style={{
          color: "#f3f3f2",
          left: "50%",
          transform: "translateX(-50%)",
          top: "70px",
        }}
      >
        TravelRadar
      </p>

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div
          className="relative overflow-hidden rounded-[18px] w-full max-w-[420px]"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <div
            className="flex flex-col gap-[12px] rounded-[13px] pt-[28px] px-[28px] pb-[28px] w-full"
            style={{ background: "#141418" }}
          >
            <p
              className="font-bold text-[11px] whitespace-nowrap"
              style={{ color: "#e5484a" }}
            >
              {mode === "signup" ? "JOIN US" : "WELCOME BACK"}
            </p>

            <p
              className="font-bold text-[24px] w-[340px] max-w-full"
              style={{ color: "#f3f3f2" }}
            >
              {mode === "signup" ? "Create your account." : "Sign in to your briefing."}
            </p>

            <p
              className="font-normal text-[13px] w-[340px] max-w-full"
              style={{ color: "#a6a6ad" }}
            >
              {city ? `We'll open ${city} after you sign in.` : "Sign in to scan destinations."}
            </p>

            <button
              type="button"
              className="h-[44px] rounded-[999px] w-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ border: "1px solid rgba(255,255,255,0.16)" }}
            >
              <span className="font-medium text-[13px]" style={{ color: "#f3f3f2" }}>
                Continue with Google
              </span>
            </button>

            <button
              type="button"
              className="h-[44px] rounded-[999px] w-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ border: "1px solid rgba(255,255,255,0.16)" }}
            >
              <span className="font-medium text-[13px]" style={{ color: "#f3f3f2" }}>
                Continue with X
              </span>
            </button>

            <p
              className="font-bold text-[10px] whitespace-nowrap"
              style={{ color: "#68686f" }}
            >
              OR EMAIL
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-[12px]">
              <div
                className="h-[46px] rounded-[999px] flex items-center pl-[16px] w-full"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="bg-transparent outline-none w-full text-[13px] font-normal"
                  style={{ color: "#f3f3f2" }}
                />
              </div>

              <div
                className="h-[46px] rounded-[999px] flex items-center pl-[16px] w-full"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password · 8+ characters"
                  className="bg-transparent outline-none w-full text-[13px] font-normal"
                  style={{ color: "#f3f3f2" }}
                />
              </div>

              {error && (
                <p className="text-[13px]" style={{ color: "#e5484a" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="h-[48px] rounded-[999px] w-full flex items-center justify-center font-semibold text-[14px] transition-opacity disabled:opacity-50 hover:opacity-90"
                style={{ background: "#f3f3f2", color: "#0a0a0c" }}
              >
                {busy ? "Working..." : mode === "signup" ? "Sign up" : "Sign in"}
              </button>
            </form>

            <button
              type="button"
              className="font-normal text-[13px] text-left hover:opacity-80 transition-opacity"
              style={{ color: "#a6a6ad" }}
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            >
              {mode === "signup"
                ? "Already have an account? Log in"
                : "New here? Create an account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}