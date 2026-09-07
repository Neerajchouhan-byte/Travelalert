"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
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
    <div className="hero-search">
      <form onSubmit={handleSubmit} className="search-bar">
        <Search className="size-4 shrink-0 text-[#68686f]" aria-hidden="true" />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Bangkok, Bali, Rome..."
          aria-label="Destination to scan"
          list="landing-cities"
        />
        <datalist id="landing-cities">
          {cities.map((c) => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>
        <button type="submit" className="btn-primary">
          <span>Scan now</span>
          <span className="icw">
            <ArrowRight className="size-3" aria-hidden="true" />
          </span>
        </button>
      </form>
      <p className="search-hint">
        CHECKED TODAY: BANGKOK &middot; BALI &middot; TOKYO &middot; ROME
        &middot; PRAGUE
      </p>
    </div>
  );
}