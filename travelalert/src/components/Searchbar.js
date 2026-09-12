"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { cities } from "@/lib/dashboard-data";
import { supabase } from "@/lib/supabase";

export default function SearchBar() {
  const router = useRouter();
  const [city, setCity] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedCity = city.trim();
    const destination = trimmedCity
      ? `?city=${encodeURIComponent(trimmedCity)}`
      : "";
    const { data } = await supabase?.auth.getSession();
    const target = data?.session ? "/dashboard" : "/login";

    router.push(`${target}${destination}`);
  }

  return (
    <div className="w-full max-w-lg">
      <form
        onSubmit={handleSubmit}
        className="flex items-center rounded-full border border-zinc-200/90 bg-white p-1.5 pl-4 shadow-sm transition focus-within:border-zinc-400 dark:border-white/10 dark:bg-[#16161b] dark:focus-within:border-white/20"
      >
        <Search className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Bangkok, Bali, Rome..."
          aria-label="Destination to scan"
          list="landing-cities"
          className="w-full bg-transparent px-3 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 sm:text-sm dark:text-white dark:placeholder:text-zinc-500"
        />
        <datalist id="landing-cities">
          {cities.map((c) => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>

        <button
          type="submit"
          className="group inline-flex shrink-0 items-center gap-1 rounded-full bg-[#e5283b] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#d32032] active:scale-95 sm:px-5"
        >
          <span>Scan now</span>
          <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </form>
    </div>
  );
}