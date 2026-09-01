"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const [city, setCity] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedCity = city.trim();
    if (!trimmedCity) return;

    router.push(`/login?city=${encodeURIComponent(trimmedCity)}`);
  }

  return (
    <div className="hero-search">
      <form onSubmit={handleSubmit} className="search-bar">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Bangkok, Bali, Rome..."
        />
        <button type="submit" className="btn-primary"><span>Scan now</span><span className="icw"><i className="fa-solid fa-arrow-right" style={{ fontSize: '.72rem' }}></i></span></button>
      </form>
      <p className="search-hint">CHECKED TODAY: BANGKOK &middot; BALI &middot; TOKYO &middot; ROME &middot; PRAGUE</p>
    </div>
  );
}