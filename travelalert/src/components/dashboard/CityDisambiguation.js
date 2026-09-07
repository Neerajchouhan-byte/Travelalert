"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search } from "lucide-react";

/**
 * CityDisambiguation - A search component that handles cities with the same name
 * by showing a dropdown with country flags and full location names.
 */
export function CityDisambiguation({ onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search cities when query changes
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/city-search?q=${encodeURIComponent(trimmed)}`
        );
        const data = await res.json();
        setResults(data.cities || []);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Handle keyboard navigation
  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose?.();
    }
  }

  function handleSelect(city) {
    onSelect?.(city);
  }

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const item = resultsRef.current.children[selectedIndex];
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-2 focus-within:border-white/20 focus-within:bg-white/[0.07]">
        <Search className="size-3.5 shrink-0 text-[#68686f] group-focus-within:text-[#a6a6ad]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search a city..."
          className="min-w-0 flex-1 bg-transparent text-sm text-[#f3f3f2] outline-none placeholder:text-[#68686f]"
        />
        {loading && (
          <div className="size-3.5 animate-spin rounded-full border border-white/20 border-t-[#5b9dee]" />
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-[#141417] shadow-xl shadow-black/40"
            ref={resultsRef}
          >
            <div className="p-1.5">
              <p className="px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#68686f]">
                Select a city
              </p>
              {results.map((city, index) => (
                <button
                  key={`${city.name}-${city.country}-${index}`}
                  type="button"
                  onClick={() => handleSelect(city)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-white/[0.08]"
                      : "hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="text-lg">{city.flag || "🌍"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#f3f3f2]">
                      {city.name}
                    </p>
                    <p className="truncate text-xs text-[#68686f]">
                      {city.country}
                      {city.admin1 ? ` · ${city.admin1}` : ""}
                    </p>
                  </div>
                  <MapPin className="size-3 shrink-0 text-[#68686f]" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint for multiple results */}
      {results.length > 1 && (
        <p className="mt-1.5 px-3.5 text-xs text-[#68686f]">
          Multiple cities found — select the one you want
        </p>
      )}
    </div>
  );
}
