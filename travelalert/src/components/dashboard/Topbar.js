"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { openCommandMenu } from "@/components/ui/command-menu";

export function Topbar({ city }) {
  const router = useRouter();
  const [searchCity, setSearchCity] = useState("");

  function handleSearch(e) {
    e.preventDefault();
    const trimmed = searchCity.trim();
    if (!trimmed) return;
    router.push(`/dashboard?city=${encodeURIComponent(trimmed)}`);
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

        {/* Direct search input - type city and press Enter */}
        <form
          onSubmit={handleSearch}
          className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-2 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
        >
          <Search className="size-3.5 shrink-0 text-[#68686f] transition-colors group-hover:text-[#a6a6ad]" />
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder={`Search a city... (current: ${city})`}
            aria-label="Search city"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#f3f3f2] outline-none placeholder:text-[#68686f]"
          />
          <button
            type="submit"
            className="hidden shrink-0 text-xs font-medium text-[#5b9dee] hover:text-[#7aaff2] sm:block"
          >
            Search
          </button>
        </form>

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
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#e5484a]/40 bg-[#e5484a]/15 text-[#e5484a] transition-colors hover:bg-[#e5484a]/25"
          >
            <UserRound className="size-3.5" />
          </Link>
        </motion.div>
      </div>
    </motion.header>
  );
}