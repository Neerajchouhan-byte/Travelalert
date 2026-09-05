"use client";

import { useState } from "react";
import Link from "next/link";
import CommandPalette from "./CommandPalette";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="nav-island">
      <Link href="/" className="nav-logo">
        <i className="fa-solid fa-satellite-dish"></i>TravelRadar
      </Link>

      <div className={`nav-links ${open ? "open" : ""}`}>
        <a href="#features" onClick={() => setOpen(false)}>Features</a>
        <a href="#how" onClick={() => setOpen(false)}>How it works</a>
        <a href="#pricing" onClick={() => setOpen(false)}>Pricing</a>
        <a
          href="/login"
          className="btn-primary nav-cta-mobile"
          onClick={() => setOpen(false)}
        >
          <span>Scan now</span>
        </a>
      </div>

      <div className="nav-right">
        <a href="/login" className="btn-primary">
          <span>Scan now</span>
          <span className="icw">
            <i className="fa-solid fa-arrow-right" style={{ fontSize: ".72rem" }}></i>
          </span>
        </a>
      </div>

      <button
        className="nav-burger"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <i
          className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`}
          style={{ fontSize: ".85rem" }}
        ></i>
      </button>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}