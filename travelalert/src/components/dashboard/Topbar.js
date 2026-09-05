"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Topbar({ city }) {
  const router = useRouter();
  const [query, setQuery] = useState(city || "");

  function handleSubmit(e) {
    e.preventDefault();
    const next = query.trim();
    if (next.length < 2) return;
    router.push("/dashboard?city=" + encodeURIComponent(next));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0c]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="hidden shrink-0 text-sm font-bold tracking-tight sm:block"
        >
          TravelRadar
        </Link>

        <form
          onSubmit={handleSubmit}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 sm:px-4"
        >
          <Search className="size-3.5 shrink-0 text-[#68686f]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a city…"
            className="h-9 min-w-0 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <button
            type="submit"
            className="shrink-0 px-1 text-[11px] font-semibold text-[#a6a6ad] hover:text-white"
          >
            Go
          </button>
        </form>

        <Link
          href="/profile"
          aria-label="Open profile"
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#e5484a]/40 bg-[#e5484a]/15 text-[#e5484a] transition-colors hover:bg-[#e5484a]/25"
        >
          <UserRound className="size-3.5" />
        </Link>
      </div>
    </header>
  );
}