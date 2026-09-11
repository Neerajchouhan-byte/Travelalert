"use client";

import Link from "next/link";
import { useState } from "react";
import { Radar, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-[#f7f6f2]/95 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-[#0c0c0e]/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/?home=1"
          aria-label="TravelRadar home"
          className="flex items-center gap-2 text-base font-black text-zinc-900 transition-opacity hover:opacity-90 dark:text-white"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#e5283b] text-white">
            <Radar className="size-4" />
          </span>
          <span>TravelRadar</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[#e5283b] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex size-8 items-center justify-center text-zinc-700 dark:text-zinc-300"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-zinc-200/80 bg-[#f7f6f2] px-4 py-4 dark:border-white/10 dark:bg-[#0c0c0e] md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-[#e5283b] px-4 py-2 text-center text-sm font-bold text-white"
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}