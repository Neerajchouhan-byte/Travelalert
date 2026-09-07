"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, Radar, X } from "lucide-react";
import CommandPalette from "./CommandPalette";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const close = () => setOpen(false);

  return (
    <div className={`nav-island ${scrolled ? "is-scrolled" : ""}`}>
      <Link href="/" className="nav-logo" onClick={close}>
        <i>
          <Radar className="size-4" aria-hidden="true" />
        </i>
        TravelRadar
      </Link>

      <div className={`nav-links ${open ? "open" : ""}`}>
        <a href="#features" onClick={close}>Features</a>
        <a href="#how" onClick={close}>How it works</a>
        <a href="#pricing" onClick={close}>Pricing</a>
        <Link
          href={isLoggedIn ? "/dashboard" : "/login"}
          className="btn-primary nav-cta-mobile"
          onClick={close}
        >
          <span>{isLoggedIn ? "Dashboard" : "Scan now"}</span>
        </Link>
      </div>

      <div className="nav-right">
        <Link href={isLoggedIn ? "/dashboard" : "/login"} className="btn-primary">
          <span>{isLoggedIn ? "Dashboard" : "Scan now"}</span>
          <span className="icw">
            <ArrowRight className="size-3" aria-hidden="true" />
          </span>
        </Link>
      </div>

      <button
        className="nav-burger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <X className="size-4" aria-hidden="true" />
        ) : (
          <Menu className="size-4" aria-hidden="true" />
        )}
      </button>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}