"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Command } from "cmdk";
import { ArrowUpRight, Command as CommandIcon, MapPin, Search, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const destinations = ["Bangkok", "Bali", "Prague", "Rome", "Tokyo", "Hanoi"];

export default function CommandPalette({ open, onOpenChange }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (event.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  function goTo(destination) {
    const city = destination.trim();
    if (!city) return;
    onOpenChange(false);
    setQuery("");
    router.push(`/login?city=${encodeURIComponent(city)}`);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="command-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onOpenChange(false);
          }}
        >
          <motion.div
            className="command-dialog"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <Command label="TravelRadar command palette" shouldFilter>
              <div className="command-search">
                <Search size={16} aria-hidden="true" />
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search a destination..."
                />
                <kbd>ESC</kbd>
              </div>
              <Command.List>
                <Command.Empty>No destination found.</Command.Empty>
                <Command.Group heading="Quick actions">
                  <Command.Item onSelect={() => goTo(query)}>
                    <ShieldAlert size={15} />
                    <span>Scan {query || "a destination"}</span>
                    <ArrowUpRight size={14} className="command-item-arrow" />
                  </Command.Item>
                  <Command.Item onSelect={() => { onOpenChange(false); document.querySelector("#scams")?.scrollIntoView({ behavior: "smooth" }); }}>
                    <ShieldAlert size={15} />
                    <span>View live scam alerts</span>
                    <ArrowUpRight size={14} className="command-item-arrow" />
                  </Command.Item>
                </Command.Group>
                <Command.Group heading="Popular destinations">
                  {destinations.map((destination) => (
                    <Command.Item key={destination} value={destination} onSelect={() => goTo(destination)}>
                      <MapPin size={15} />
                      <span>{destination}</span>
                      <span className="command-item-hint">Scan brief</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
              <div className="command-footer"><span><CommandIcon size={13} /> Navigate</span><span>Enter to select</span></div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
