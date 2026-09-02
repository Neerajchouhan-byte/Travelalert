"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function RequireAuth({ children }) {
  const router = useRouter();
  const city = useSearchParams().get("city") || "";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        const next = city
          ? `/login?city=${encodeURIComponent(city)}`
          : "/login";
        router.replace(next);
        return;
      }
      setReady(true);
    });
  }, [router, city]);

  if (!ready) {
    return <div className="p-8 text-[#a6a6ad]">Checking session…</div>;
  }

  return children;
}