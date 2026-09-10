"use client";

import { Search, Radar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { findKnownCity } from "@/lib/dashboard-data";

function flagToCode(flag) {
  const pts = [...String(flag || "")].map((ch) => ch.codePointAt(0));
  if (
    pts.length === 2 &&
    pts[0] >= 0x1f1e6 &&
    pts[0] <= 0x1f1ff &&
    pts[1] >= 0x1f1e6 &&
    pts[1] <= 0x1f1ff
  ) {
    return String.fromCharCode(pts[0] - 0x1f1e6 + 65, pts[1] - 0x1f1e6 + 65);
  }
  return "";
}

export function Topbar({ city, brief }) {
  const router = useRouter();
  const [searchCity, setSearchCity] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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

  useEffect(() => {
    const trimmed = searchCity.trim();
    if (trimmed.length < 2) {
      const reset = setTimeout(() => {
        setSuggestions([]);
        setShowSuggestions(false);
      }, 0);
      return () => clearTimeout(reset);
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
    e?.preventDefault();
    const trimmed = searchCity.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    router.push(`/dashboard?city=${encodeURIComponent(trimmed)}&refresh=1`);
  }

  function handleCitySelect(cityItem) {
    setShowSuggestions(false);
    setSearchCity("");
    setMobileSearchOpen(false);
    router.push(
      `/dashboard?city=${encodeURIComponent(cityItem.name)}&country=${encodeURIComponent(cityItem.country_code)}&refresh=1`
    );
  }

  function handleProfileClick() {
    router.push("/profile");
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
      return user.email.slice(0, 2).toUpperCase();
    }
    return "AR";
  }

  const meta = findKnownCity(city);
  const countryCode = (
    brief?.country_code ||
    flagToCode(meta?.flag) ||
    ""
  ).toUpperCase();

  const displayName = brief?.city
    ? `${brief.city}${brief.country ? `, ${brief.country}` : ""}`
    : meta?.name || city;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-[#f7f6f2]/95 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-[#0c0c0e]/95">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        {/* Mobile top status bar (<md) */}
        <div className="flex items-center justify-between md:hidden">
          <div className="flex items-center gap-3">
            <Link
              href="/?home=1"
              aria-label="TravelRadar home"
              className="flex items-center gap-2 transition-opacity hover:opacity-90"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#e5283b] text-white">
                <Radar className="size-4" />
              </span>
            </Link>
            <span className="live-dot" />
            <span className="font-mono text-xs font-bold tracking-wider text-[#e5283b] dark:text-[#f87171]">
              LIVE RADAR
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label="Search destination"
              className="flex size-8 items-center justify-center text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              <Search className="size-4.5" />
            </button>
            <button
              type="button"
              onClick={handleProfileClick}
              aria-label="Open profile"
              className="rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#e5283b]/40"
            >
              <Avatar size="sm" className="size-8">
                <AvatarImage src={avatarUrl} alt="Avatar" />
                <AvatarFallback className="bg-[#e5283b] text-xs font-bold text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>

                       {mobileSearchOpen && (
          <div className="relative mt-2.5 md:hidden">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3.5 py-2 shadow-xs dark:border-white/15 dark:bg-[#16161b]">
                <Search className="size-4 text-zinc-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Search destinations..."
                  className="w-full bg-transparent text-xs text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
                />
                {loading && (
                  <div className="size-3.5 animate-spin rounded-full border border-red-500 border-t-transparent" />
                )}
              </div>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#16161b]">
                {suggestions.map((item, idx) => (
                  <button
                    key={`m-${item.name}-${idx}`}
                    type="button"
                    onMouseDown={() => handleCitySelect(item)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/5"
                  >
                    <span>{item.flag || "🌍"}</span>
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-zinc-400">· {item.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sub-row for mobile-only: destination heading */}
        <div className="mt-2 flex items-center gap-2.5 md:hidden">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
            {displayName}
          </h1>
          {countryCode && (
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase text-[#e5283b] dark:bg-rose-950/70 dark:text-[#f87171]">
              {countryCode}
            </span>
          )}
        </div>

        {/* Desktop & tablet single-row layout (md+) */}
        <div className="hidden items-center justify-between gap-4 md:flex">
          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              href="/?home=1"
              aria-label="TravelRadar home"
              className="flex items-center gap-2 transition-opacity hover:opacity-90"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-[#e5283b] text-white">
                <Radar className="size-4.5" />
              </span>
              <span className="hidden text-lg font-black tracking-tight text-zinc-900 lg:inline dark:text-white">
                TravelRadar
              </span>
            </Link>
            <div className="flex items-center gap-2.5 border-l border-zinc-200 pl-3 dark:border-white/10">
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 xl:text-3xl dark:text-white">
                {displayName}
              </h1>
              {countryCode && (
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase text-[#e5283b] dark:bg-rose-950/70 dark:text-[#f87171]">
                  {countryCode}
                </span>
              )}
            </div>
          </div>

          <div className="relative w-full max-w-md">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2.5 rounded-full border border-zinc-200/90 bg-white px-4 py-2 shadow-2xs transition-colors hover:border-zinc-300 dark:border-white/10 dark:bg-[#16161b]"
            >
              <Search className="size-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search destinations..."
                className="w-full bg-transparent text-xs text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
              />
              {loading && (
                <div className="size-3.5 animate-spin rounded-full border border-red-500 border-t-transparent" />
              )}
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#16161b]">
                {suggestions.map((item, idx) => (
                  <button
                    key={`${item.name}-${idx}`}
                    type="button"
                    onMouseDown={() => handleCitySelect(item)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/5"
                  >
                    <span>{item.flag || "🌍"}</span>
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-zinc-400">· {item.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <div className="hidden items-center gap-2 lg:flex">
              <span className="live-dot" />
              <span className="font-mono text-xs font-bold tracking-wider text-[#e5283b] dark:text-[#f87171]">
                LIVE RADAR
              </span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                2m ago
              </span>
            </div>

            <ThemeToggle />

            <button
              type="button"
              onClick={handleProfileClick}
              aria-label="Open profile"
              className="rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#e5283b]/40"
            >
              <Avatar size="sm" className="size-9">
                <AvatarImage src={avatarUrl} alt="Avatar" />
                <AvatarFallback className="bg-[#e5283b] text-xs font-bold text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}