"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { openCommandMenu } from "@/components/ui/command-menu";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function Topbar({ city }) {
  const router = useRouter();
  const [searchCity, setSearchCity] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Get current user and avatar
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);

      if (data?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url, display_name")
          .eq("user_id", data.user.id)
          .single();
        setAvatarUrl(profile?.avatar_url || null);
      }
    })();
  }, []);

  // Search cities when query changes
  useEffect(() => {
    const trimmed = searchCity.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/city-search?q=${encodeURIComponent(trimmed)}`
        );
        const data = await res.json();
        setSuggestions(data.cities || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchCity]);

  function handleSearch(e) {
    e.preventDefault();
    const trimmed = searchCity.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    router.push(`/dashboard?city=${encodeURIComponent(trimmed)}`);
  }

  function handleCitySelect(cityItem) {
    setShowSuggestions(false);
    setSearchCity("");
    router.push(
      `/dashboard?city=${encodeURIComponent(cityItem.name)}&country=${encodeURIComponent(cityItem.country_code)}`
    );
  }

  function getInitials() {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  }

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0c]/85 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="hidden shrink-0 text-sm font-bold tracking-tight transition-opacity hover:opacity-80 sm:block"
        >
          TravelRadar
        </Link>

        {/* Search with city disambiguation */}
        <div className="relative min-w-0 flex-1">
          <form
            onSubmit={handleSearch}
            className="group flex min-w-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-2 transition-colors hover:border-white/20 hover:bg-white/[0.07] focus-within:border-white/20 focus-within:bg-white/[0.07]"
          >
            <Search className="size-3.5 shrink-0 text-[#68686f] transition-colors group-hover:text-[#a6a6ad]" />
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search a city..."
              aria-label="Search city"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#f3f3f2] outline-none placeholder:text-[#68686f]"
            />
            {loading && (
              <div className="size-3.5 animate-spin rounded-full border border-white/20 border-t-[#5b9dee]" />
            )}
            <button
              type="submit"
              className="hidden shrink-0 text-xs font-medium text-[#5b9dee] hover:text-[#7aaff2] sm:block"
            >
              Search
            </button>
          </form>

          {/* City Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-[#141417] shadow-xl shadow-black/40">
              <div className="p-1.5">
                {suggestions.length > 1 && (
                  <p className="px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#68686f]">
                    Multiple cities found — select one
                  </p>
                )}
                {suggestions.map((cityItem, index) => (
                  <button
                    key={`${cityItem.name}-${cityItem.country}-${index}`}
                    type="button"
                    onMouseDown={() => handleCitySelect(cityItem)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.08]"
                  >
                    <span className="text-lg">{cityItem.flag || "🌍"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#f3f3f2]">
                        {cityItem.name}
                      </p>
                      <p className="truncate text-xs text-[#68686f]">
                        {cityItem.country}
                        {cityItem.admin1 ? ` · ${cityItem.admin1}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Command palette trigger — keyboard-first search */}
        <button
          type="button"
          onClick={openCommandMenu}
          aria-label="Open command menu"
          className="hidden shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1.5 transition-colors hover:border-white/20 hover:bg-white/[0.07] sm:flex"
        >
          <kbd className="inline-flex h-5 select-none items-center rounded border border-white/10 bg-white/[0.06] px-1.5 font-mono text-[10px] text-[#a6a6ad]">
            ⌘
          </kbd>
          <kbd className="inline-flex h-5 select-none items-center rounded border border-white/10 bg-white/[0.06] px-1.5 font-mono text-[10px] text-[#a6a6ad]">
            K
          </kbd>
        </button>

        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
          <Link
            href="/profile"
            aria-label="Open profile"
            className="block"
          >
            <Avatar size="sm" className="border border-[#e5484a]/40">
              <AvatarImage src={avatarUrl} alt="User avatar" />
              <AvatarFallback className="bg-[#e5484a]/15 text-[#e5484a] text-xs font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </motion.div>
      </div>
    </motion.header>
  );
}