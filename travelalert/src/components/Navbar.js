"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Menu, Radar, X } from "lucide-react";
import CommandPalette from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setIsLoggedIn(Boolean(data?.session));
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(Boolean(session));
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const close = () => setOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-[#e8e6df]/80 bg-[#f7f6f2]/90 backdrop-blur-md dark:border-white/10 dark:bg-[#0c0c0e]/90"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-base font-black tracking-tight text-zinc-900 transition-opacity hover:opacity-90 sm:text-lg dark:text-white"
          onClick={close}
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#e5283b] text-white">
            <Radar className="size-4" />
          </span>
          <span>TravelRadar</span>
        </Link>

        {/* Center Links (Desktop) */}
        <nav className="hidden items-center gap-8 text-xs font-semibold text-zinc-500 md:flex dark:text-zinc-400">
          <a href="#features" className="transition hover:text-zinc-900 dark:hover:text-white">
            Features
          </a>
          <a href="#how" className="transition hover:text-zinc-900 dark:hover:text-white">
            How it works
          </a>
          <a href="#pricing" className="transition hover:text-zinc-900 dark:hover:text-white">
            Pricing
          </a>
        </nav>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#e5283b] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#d32032] active:scale-95"
          >
            <span>{isLoggedIn ? "Dashboard" : "Scan now"}</span>
            <ChevronRight className="size-3.5" />
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-600 md:hidden dark:border-white/10 dark:bg-[#16161b] dark:text-zinc-400"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="border-b border-zinc-200/80 bg-[#f7f6f2]/95 px-6 py-4 backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-[#0c0c0e]/95">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <a href="#features" onClick={close} className="py-1 hover:text-[#e5283b]">
              Features
            </a>
            <a href="#how" onClick={close} className="py-1 hover:text-[#e5283b]">
              How it works
            </a>
            <a href="#pricing" onClick={close} className="py-1 hover:text-[#e5283b]">
              Pricing
            </a>
          </nav>
        </div>
      )}

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}