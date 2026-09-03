"use client";

import { CloudRain, Sun } from "lucide-react";
import { Panel } from "./Panel";

export function WeatherCard({ brief }) {
  const w = brief?.weather;
  const rainy = w && w.code >= 50;

  return (
    <Panel>
      <div className="p-5">
        <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#68686f]">
          Current conditions{brief?.city ? ` · ${brief.city}` : ""}
        </div>
        <div className="mb-1 flex items-baseline gap-2">
          <span className="font-mono text-[1.7rem] font-bold">
            {w ? `${w.temp}°C` : "—"}
          </span>
          {rainy ? (
            <CloudRain className="size-5 text-[#5b9dee]" />
          ) : (
            <Sun className="size-5 text-[#f0a63d]" />
          )}
        </div>
        <p className="mb-3 text-xs text-[#a6a6ad]">
          {w
            ? `Humidity ${w.humidity}% · Feels like ${w.feels}°C · UV ${w.uv ?? "—"}`
            : "Loading weather…"}
        </p>
        <div className="rounded-lg border border-[rgba(240,166,61,0.38)] bg-[rgba(240,166,61,0.13)] p-2.5">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-bold text-[#f0a63d]">
            {rainy ? <CloudRain className="size-3.5" /> : <Sun className="size-3.5" />}
            {brief?.weather_headline || "…"}
          </div>
          <p className="text-[11px] leading-relaxed text-[#a6a6ad]">
            {brief?.weather_note || "AI will describe what to wear and watch for."}
          </p>
        </div>
      </div>
    </Panel>
  );
}