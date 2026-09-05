"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function RequireAuth({ children }) {
  const router = useRouter();
  const city = useSearchParams().get("city") || "";
  const [ready, setReady] = useState(false);
  const [configError, setConfigError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setConfigError("Authentication is not configured.");
      return;
    }

    let off = false;
    supabase.auth.getSession().then(({ data }) => {
      if (off) return;
      if (!data.session) {
        const next = city
          ? `/login?city=${encodeURIComponent(city)}`
          : "/login";
        router.replace(next);
        return;
      }
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        const next = city
          ? `/login?city=${encodeURIComponent(city)}`
          : "/login";
        router.replace(next);
      }
    });

    return () => {
      off = true;
      sub?.subscription?.unsubscribe();
    };
  }, [router, city]);

  if (configError) {
    return <div className="p-8 text-red-300">{configError}</div>;
  }
  if (!ready) {
    return <div className="p-8 text-[#a6a6ad]">Checking session…</div>;
  }
  return children;
}