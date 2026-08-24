"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [city, setCity] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    if (!city.trim()) return;
    router.push("/login?city=" + encodeURIComponent(city.trim()));
  }

  return (
    <div className="hero-search">
      <form onSubmit={handleSubmit} className="search-bar">
        <span className="s-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </span>
        <input
          className="s-input"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search a destination — Bangkok, Bali, Rome..."
        />
        <button type="submit" className="s-btn">
          Check for Scams
        </button>
      </form>
      <p className="search-hint">
        Checked today: Bangkok · Bali · Tokyo · Hanoi · Rome · Prague
      </p>
    </div>
  );
}