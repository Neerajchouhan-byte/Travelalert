"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { destinationMeta } from "@/lib/dashboard-data";

export function Topbar({ city }) {
  const router = useRouter();
  const meta = destinationMeta[city];
  const label = meta?.name || city;
  const [query, setQuery] = useState(label);

  useEffect(() => {
    setQuery(label);
  }, [label]);

  function handleSubmit(e) {
    e.preventDefault();
    const next = query.trim();
    if (next.length < 2) return;
    router.push("/dashboard?city=" + encodeURIComponent(next));
  }

  return (
    <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-white/10 bg-[#0a0a0c]/85 px-8 py-3 backdrop-blur-md max-md:px-4">
      <SidebarTrigger className="text-[#f3f3f2]" />
      <form
        onSubmit={handleSubmit}
        className="flex max-w-md flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4"
      >
        <Search className="size-3.5 shrink-0 text-[#68686f]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a city…"
          className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <button
          type="submit"
          className="shrink-0 text-[11px] font-semibold text-[#a6a6ad] hover:text-white"
        >
          Go
        </button>
      </form>
      <div className="ml-auto flex items-center gap-3">
        <span className="rounded-full border border-[#f0a63d]/40 bg-[#f0a63d]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#f0a63d] max-md:hidden">
          Free · 2/3 searches used
        </span>
        <Button
          size="icon"
          variant="outline"
          className="relative size-8 rounded-full border-white/10 bg-white/[0.045]"
        >
          <Bell className="size-3.5" />
          <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-[#e5484a]" />
        </Button>
      </div>
    </header>
  );
}