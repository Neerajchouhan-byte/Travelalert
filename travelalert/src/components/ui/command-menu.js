"use client";

import { useCallback, useEffect, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  Compass,
  Crown,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import { cities } from "@/lib/dashboard-data";

const OPEN_EVENT = "travelradar:open-command";

export function openCommandMenu() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

function Kbd({ children }) {
  return (
    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-white/10 bg-white/[0.06] px-1.5 font-mono text-[10px] font-medium text-[#a6a6ad]">
      {children}
    </kbd>
  );
}

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  const go = useCallback(
    (path) => {
      setOpen(false);
      router.push(path);
    },
    [router],
  );

  const run = useCallback((fn) => {
    setOpen(false);
    fn();
  }, []);

  // Triggers a real live refresh: preserves the current path and query, sets
  // refresh=1, and drops cached_only if it was set. The dashboard's
  // briefing effect reads those params and runs the pipeline.
  const refreshBriefing = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("refresh", "1");
    url.searchParams.delete("cached_only");
    router.push(url.pathname + url.search);
  }, [router]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 fixed left-1/2 top-[12%] z-[100] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-white/12 bg-[#101013]/95 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.8)] outline-none sm:top-[18%]"
        >
          <DialogPrimitive.Title className="sr-only">
            Command menu
          </DialogPrimitive.Title>

          <CommandPrimitive
            loop
            value={query}
            onValueChange={setQuery}
            className="overflow-hidden rounded-2xl [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-[#68686f]"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search className="size-4 shrink-0 text-[#68686f]" />
              <CommandPrimitive.Input
                autoFocus
                placeholder="Search a city or command…"
                className="h-12 w-full bg-transparent text-sm text-[#f3f3f2] outline-none placeholder:text-[#68686f]"
              />
              <Kbd>esc</Kbd>
            </div>

            <CommandPrimitive.List className="max-h-[min(22rem,50vh)] overflow-y-auto overflow-x-hidden p-2 scroll-py-2">
              <CommandPrimitive.Empty className="py-8 text-center text-xs text-[#68686f]">
                No results found.
              </CommandPrimitive.Empty>

              <CommandPrimitive.Group heading="Jump to city">
                {cities.map((c) => (
                  <Item
                    key={c.name}
                    value={`city ${c.name}`}
                    onSelect={() =>
                      go(`/dashboard?city=${encodeURIComponent(c.name)}`)
                    }
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="flex-1 truncate text-sm">{c.name}</span>
                    <ArrowRight className="size-3.5 text-[#68686f] opacity-0 transition-opacity group-data-[selected=true]/item:opacity-100" />
                  </Item>
                ))}
              </CommandPrimitive.Group>

              <CommandPrimitive.Group heading="Actions">
                <Item
                  value="refresh briefing reload"
                  onSelect={() => run(refreshBriefing)}
                >
                  <RefreshCw className="size-3.5 text-[#a6a6ad]" />
                  <span className="flex-1 text-sm">Refresh live briefing</span>
                </Item>
                <Item
                  value="profile account"
                  onSelect={() => go("/profile")}
                >
                  <UserRound className="size-3.5 text-[#a6a6ad]" />
                  <span className="flex-1 text-sm">Your profile</span>
                </Item>
                <Item
                  value="upgrade pro pricing"
                  onSelect={() => run(() => go("/dashboard?upgrade=true"))}
                >
                  <Crown className="size-3.5 text-[#f0a63d]" />
                  <span className="flex-1 text-sm">Upgrade to Pro</span>
                  <ArrowUpRight className="size-3.5 text-[#68686f]" />
                </Item>
                <Item
                  value="disclaimer safety"
                  onSelect={() => go("/disclaimer")}
                >
                  <BookOpenText className="size-3.5 text-[#a6a6ad]" />
                  <span className="flex-1 text-sm">Read the disclaimer</span>
                </Item>
              </CommandPrimitive.Group>

              {query.trim().length >= 2 && (
                <CommandPrimitive.Group heading="Search any destination">
                  <Item
                    value={`search for ${query.trim().toLowerCase()}`}
                    onSelect={() =>
                      go(`/dashboard?city=${encodeURIComponent(query.trim())}`)
                    }
                  >
                    <Search className="size-3.5 text-[#5b9dee]" />
                    <span className="flex-1 truncate text-sm">
                      Search for “{query.trim()}”
                    </span>
                    <ArrowRight className="size-3.5 text-[#68686f] opacity-70" />
                  </Item>
                </CommandPrimitive.Group>
              )}
            </CommandPrimitive.List>

            <div className="flex items-center gap-4 border-t border-white/10 bg-white/[0.02] px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-[10px] text-[#68686f]">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                navigate
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-[#68686f]">
                <Kbd>↵</Kbd>
                select
              </span>
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-[#68686f]">
                <Compass className="size-3" />
                TravelRadar
              </span>
            </div>
          </CommandPrimitive>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Item({ children, value, onSelect }) {
  return (
    <CommandPrimitive.Item
      value={value}
      onSelect={onSelect}
      className="group/item relative flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 text-[#a6a6ad] outline-none data-[disabled=true]:pointer-events-none data-[selected=true]/item:bg-white/[0.07] data-[selected=true]/item:text-[#f3f3f2] data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-[#f3f3f2]"
    >
      {children}
    </CommandPrimitive.Item>
  );
}