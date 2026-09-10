"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Radar, Search, X } from "lucide-react";
import CommandPalette from "@/components/CommandPalette";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3.5 sm:px-6">
        <nav
          className={`nav-island flex w-full max-w-7xl items-center justify-between rounded-full border border-zinc-200/80 px-4 py-2.5 backdrop-blur-md dark:border-white/10 ${
            isScrolled
              ? "is-scrolled bg-white/90 shadow-md dark:bg-[#101013]/90"
              : "bg-white/70 dark:bg-[#101013]/70"
          }`}
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#e5283b] text-white">
              <Radar className="size-4" />
            </span>
            <span className="text-base font-black tracking-tight text-zinc-900 dark:text-white">
              TravelRadar
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden items-center gap-6 text-xs font-semibold text-zinc-600 md:flex dark:text-zinc-400">
            <a href="#features" className="transition hover:text-zinc-900 dark:hover:text-white">
              Features
            </a>
            <a href="#how" className="transition hover:text-zinc-900 dark:hover:text-white">
              How it works
            </a>
            <a href="#scams" className="transition hover:text-zinc-900 dark:hover:text-white">
              Live alerts
            </a>
            <a href="#pricing" className="transition hover:text-zinc-900 dark:hover:text-white">
              Pricing
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Quick Command / Search trigger */}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="nav-search hidden items-center gap-2 rounded-full border border-zinc-200/80 bg-zinc-100/70 px-3 py-1.5 text-xs text-zinc-500 transition hover:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:border-white/20 sm:inline-flex"
            >
              <Search className="size-3.5" />
              <span>Search...</span>
              <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 dark:border-white/10 dark:bg-zinc-800">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />

            <Link
              href="/login"
              className="rounded-full px-3.5 py-1.5 text-xs font-bold text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              Log in
            </Link>

            <Link
              href="/login?mode=signup"
              className="rounded-full bg-[#e5283b] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#d32032] active:scale-95"
            >
              Scan now
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="flex size-8 items-center justify-center text-zinc-600 md:hidden dark:text-zinc-400"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="nav-links open absolute left-4 right-4 top-16 rounded-2xl border border-zinc-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-md md:hidden dark:border-white/10 dark:bg-[#141418]/95">
            <div className="flex flex-col gap-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-zinc-950 dark:hover:text-white"
              >
                Features
              </a>
              <a
                href="#how"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-zinc-950 dark:hover:text-white"
              >
                How it works
              </a>
              <a
                href="#scams"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-zinc-950 dark:hover:text-white"
              >
                Live alerts
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-zinc-950 dark:hover:text-white"
              >
                Pricing
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}