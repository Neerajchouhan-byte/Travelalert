"use client";
import { useEffect, useState } from "react";
import { Plus, X, CalendarDays } from "lucide-react";
import { cities } from "@/lib/dashboard-data";
import { TRIP_MIN_DESTINATIONS, TRIP_MAX_DESTINATIONS } from "@/lib/trips";

export function TripBuilder({ initialName = "", initialDestinations = [], onSubmit, saving = false, submitLabel = "Save trip" }) {
  const [name, setName] = useState(initialName);
  const [stops, setStops] = useState(() => initialDestinations.map((d) => (typeof d === "string" ? { city: d, visit_date: "" } : { city: d.city || "", visit_date: d.visit_date || "" })));
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { setName(initialName); }, [initialName]);
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/city-search?q=${encodeURIComponent(q)}`);
        const j = await r.json();
        setSuggestions(j.cities || []);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);
  function addCity(cityName) {
    setError("");
    const clean = String(cityName || "").trim();
    if (!clean) return;
    if (stops.some((s) => s.city.toLowerCase() === clean.toLowerCase())) { setError(`${clean} is already in this trip.`); return; }
    if (stops.length >= TRIP_MAX_DESTINATIONS) { setError(`Trips support up to ${TRIP_MAX_DESTINATIONS}.`); return; }
    setStops((s) => [...s, { city: clean, visit_date: "" }]);
    setQuery(""); setSuggestions([]);
  }
  function removeAt(i) { setStops((s) => s.filter((_, x) => x !== i)); }
  function setDate(i, v) { setStops((s) => s.map((x, xi) => (xi === i ? { ...x, visit_date: v } : x))); }
  function handleSubmit(e) {
    e.preventDefault(); setError("");
    if (stops.length < TRIP_MIN_DESTINATIONS) { setError(`Add at least ${TRIP_MIN_DESTINATIONS} destinations.`); return; }
    onSubmit?.({ name: name.trim() || "My Trip", destinations: stops.map((s) => ({ city: s.city, visit_date: s.visit_date || null })) });
  }
  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
      <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">Trip name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="e.g. Southeast Asia loop"
        className="mt-1.5 h-11 w-full rounded-full border px-4 text-sm outline-none dark:bg-[#0c0c0e] dark:text-white border-zinc-200/90 dark:border-white/10" />
      <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">Destinations · {stops.length}/{TRIP_MAX_DESTINATIONS}</p>
      <div className="no-scrollbar mt-2 flex items-center gap-2 overflow-x-auto pb-1">
        {cities.map((c) => {
          const added = stops.some((s) => s.city.toLowerCase() === c.name.toLowerCase());
          return (
            <button key={c.name} type="button" disabled={added} onClick={() => addCity(c.name)}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs font-bold border border-zinc-200/90 dark:border-white/10">
              <span>{c.flag}</span><span>{c.name}</span><Plus className="size-3.5" />
            </button>
          );
        })}
      </div>
      <div className="relative mt-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Or type any city…"
          className="h-11 w-full rounded-full border px-4 text-sm outline-none dark:bg-[#0c0c0e] dark:text-white border-zinc-200/90 dark:border-white/10" />
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-2xl border bg-white p-1.5 shadow-xl dark:bg-[#0c0c0e]">
            {suggestions.map((s, i) => (
              <button key={`${s.name}-${i}`} type="button" onMouseDown={() => addCity(s.name)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs hover:bg-zinc-100">
                <span>{s.flag || "🌍"}</span><b>{s.name}</b><span className="text-zinc-400">· {s.country}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <ul className="mt-3 space-y-2">
        {stops.map((s, i) => (
          <li key={`${s.city}-${i}`} className="flex items-center gap-2 rounded-2xl border border-zinc-100 px-3 py-2 dark:border-white/5">
            <span className="font-mono text-[11px] font-bold text-zinc-400">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1 text-sm font-bold">{s.city}</span>
            <span className="flex items-center gap-1 text-zinc-400"><CalendarDays className="size-3.5" />
              <input type="date" value={s.visit_date || ""} onChange={(e) => setDate(i, e.target.value)}
                className="bg-transparent text-xs outline-none" aria-label={`Visit date for ${s.city}`} />
            </span>
            <button type="button" onClick={() => removeAt(i)} aria-label={`Remove ${s.city}`}><X className="size-4" /></button>
          </li>
        ))}
      </ul>
      {error && <p className="mt-3 text-xs font-semibold text-red-500">{error}</p>}
      <button type="submit" disabled={saving} className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-black text-xs font-bold text-white disabled:opacity-60">
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
