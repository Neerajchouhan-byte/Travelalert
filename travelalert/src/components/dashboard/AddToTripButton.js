"use client";

import { useEffect, useRef, useState } from "react";
import { Route, LoaderCircle, Check, AlertTriangle, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Compact action pill for the dashboard. On click it calls
 * POST /api/trips/quick-add, which:
 *   - creates a "My Trip" if the user has none, or appends to the most
 *     recent one;
 *   - lazily caches intel for the city if missing (same organizeCity
 *     pipeline the pre-cache script uses);
 *   - returns a status we render as specific feedback.
 *
 * Plan gating happens server-side (403 upgradeRequired). The client just
 * routes that to the existing upgrade modal.
 */
export function AddToTripButton({ city, plan = "free", onUpgrade }) {
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const timeoutRef = useRef(null);
  const resetRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (resetRef.current) clearTimeout(resetRef.current);
    };
  }, []);

  // Reset feedback when the user switches city.
  useEffect(() => {
    setState("idle");
    setMessage("");
  }, [city]);

  const paid = plan !== "free";
  const busy = state === "adding";

  async function handleClick() {
    if (busy) return;

    if (!paid) {
      onUpgrade?.();
      return;
    }

    setState("adding");
    setMessage("Adding to trip…");

    // After 800ms of waiting, upgrade the message to signal that the
    // on-demand intel fetch is running. The server response arrives when
    // the pipeline (Reddit → Gemini → cache write) finishes, which is a
    // few seconds on a cold city.
    timeoutRef.current = setTimeout(() => {
      setMessage(`Fetching intel for ${city}…`);
    }, 800);

    try {
      const { data } = await supabase?.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) {
        setState("failed");
        setMessage("Please sign in again.");
        return;
      }

      const res = await fetch("/api/trips/quick-add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.status === 403 && body.upgradeRequired) {
        setState("idle");
        setMessage("");
        onUpgrade?.();
        return;
      }

      if (!res.ok) {
        const code = body.code;
        if (code === "DUPLICATE_DESTINATION") {
          setState("duplicate");
          setMessage(body.error || "Already in this trip.");
        } else if (code === "TRIP_FULL") {
          setState("limit");
          setMessage(body.error || "Trip is already full.");
        } else {
          setState("failed");
          setMessage(body.error || "Could not add to trip.");
        }
        return;
      }

      const status = body.intel?.status;
      const tripName = body.tripName || "your trip";
      if (status === "empty") {
        setState("success");
        setMessage(`Added to ${tripName}. No scam reports found for ${city} yet.`);
      } else if (status === "failed") {
        setState("success");
        setMessage(`Added to ${tripName}. Intel fetch failed — check back later.`);
      } else {
        setState("success");
        setMessage(`Added to ${tripName}.`);
      }
      // Auto-reset so the button is usable again for the same city.
      resetRef.current = setTimeout(() => {
        setState("idle");
        setMessage("");
      }, 4500);
    } catch (err) {
      setState("failed");
      setMessage(err?.message || "Could not add to trip.");
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }

  const tone =
    state === "duplicate"
      ? "border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
      : state === "limit"
        ? "border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
        : state === "failed"
          ? "border-red-300/70 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
          : state === "success"
            ? "border-emerald-300/70 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
            : "border-zinc-200/90 bg-white text-zinc-800 dark:border-white/10 dark:bg-[#16161b] dark:text-zinc-200";

  const Icon =
    busy ? LoaderCircle
    : state === "success" ? Check
    : state === "duplicate" || state === "limit" ? Info
    : state === "failed" ? AlertTriangle
    : Route;

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-busy={busy}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold transition-colors disabled:opacity-70 ${tone}`}
      >
        <Icon className={`size-3.5 ${busy ? "animate-spin" : ""}`} />
        <span>{busy ? (message || "Adding…") : paid ? "Add to trip" : "Add to trip (Pro)"}</span>
      </button>
      {!busy && message && state !== "idle" && (
        <p className="text-center text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {message}
        </p>
      )}
    </div>
  );
}