"use client";

import { motion } from "framer-motion";
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  Sunrise,
  Sunset,
} from "lucide-react";
import { CardGlow } from "@/components/ui/card-glow";
import { AnimatedNumber } from "@/components/ui/animated-number";

const RAINY_CODES = [
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
];

export function WeatherCard({ brief }) {
  const w = brief?.weather;
  const isRainy = w?.code != null ? RAINY_CODES.includes(w.code) : false;

  // Fallbacks
  const cityName = brief?.city || "New York";
  const temp = w?.temp ?? 10;
  const condition = w?.condition ?? (isRainy ? "Rainy" : "Cloudy");
  const rainChance = w?.rain_chance ?? (isRainy ? 90 : 20);
  const humidity = w?.humidity ?? 73;
  const windSpeed = w?.wind_kph ?? 10;
  const sunrise = w?.sunrise ?? "4:53 am";
  const sunset = w?.sunset ?? "8:13 pm";
  const daylight = w?.daylight ?? "15 h 32 m";

  const weeklyForecast = brief?.forecast || [
    { day: "Today", temp: temp, type: isRainy ? "rain" : "partly-cloudy" },
    { day: "Wed", temp: 10, type: "partly-cloudy" },
    { day: "Thu", temp: 10, type: "thunder" },
    { day: "Fri", temp: 10, type: "sun" },
    { day: "Sat", temp: 10, type: "partly-cloudy" },
    { day: "Sun", temp: 10, type: "rain" },
    { day: "Mon", temp: 10, type: "partly-cloudy" },
  ];

  const renderIcon = (type, sizeClass = "size-5") => {
    switch (type) {
      case "rain":
        return <CloudRain className={`${sizeClass} text-[#5b9dee]`} />;
      case "thunder":
        return <CloudLightning className={`${sizeClass} text-[#f0a63d]`} />;
      case "sun":
        return <Sun className={`${sizeClass} text-[#f0a63d]`} />;
      case "partly-cloudy":
      default:
        return <CloudSun className={`${sizeClass} text-[#f0a63d]`} />;
    }
  };

  return (
    <CardGlow
      glowColor="rgba(240, 166, 61, 0.12)"
      borderColor="rgba(240, 166, 61, 0.3)"
    >
      <div className="flex h-full w-full flex-col p-3.5 sm:p-4">
        
        {/* 1. Top Section (Dark Card with Gradient & Ambient Border) */}
        <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-b from-[#242429] via-[#1a1a1e] to-[#121316] p-3 shadow-lg">
          <div className="flex items-center justify-between">
            {/* Animated Condition Icon */}
            <motion.div
              className="relative flex size-14 items-center justify-center"
              animate={
                isRainy
                  ? { y: [0, 3, 0] }
                  : { rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }
              }
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {isRainy ? (
                <CloudRain className="size-10 text-[#5b9dee] drop-shadow-[0_0_12px_rgba(91,157,238,0.3)]" />
              ) : (
                <CloudSun className="size-10 text-[#f0a63d] drop-shadow-[0_0_12px_rgba(240,166,61,0.35)]" />
              )}
            </motion.div>

            {/* Condition, Temperature & Location */}
            <div className="flex flex-1 flex-col pl-4">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#a6a6ad]">
                Tuesday, 11:56
              </span>
              <div className="flex items-baseline gap-1 text-xl font-bold tracking-tight text-[#f3f3f2] sm:text-2xl">
                <span>{condition}</span>
                <span className="font-mono">
                  {w?.temp != null ? <AnimatedNumber value={temp} suffix="°C" /> : `${temp}°C`}
                </span>
              </div>
              <span className="text-xs font-medium text-[#68686f] sm:text-sm">
                {cityName}
              </span>
            </div>
          </div>

          {/* Daylight / Solar Capsule Pill */}
          <div className="mt-3 flex items-center justify-between rounded-full border border-white/5 bg-[#0e0f12]/90 px-3.5 py-1.5 text-[11px] text-[#a6a6ad] sm:text-xs">
            <div className="flex items-center gap-1.5 font-mono">
              <Sunrise className="size-3.5 text-[#f0a63d]" />
              <span>{sunrise}</span>
            </div>
            <span className="font-mono font-medium tracking-tight text-[#f3f3f2]">
              {daylight}
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              <span>{sunset}</span>
              <Sunset className="size-3.5 text-[#f0a63d]" />
            </div>
          </div>
        </div>

        {/* 2. Middle Capsule: Rain Probability */}
        <div className="mt-2.5 flex items-center justify-center gap-2.5 rounded-full border border-white/5 bg-[#121316] py-2 text-[#f3f3f2] shadow-sm">
          <CloudRain className="size-4 text-[#5b9dee]" />
          <span className="font-mono text-sm font-semibold tracking-wide">
            Rain: {rainChance}%
          </span>
        </div>

        {/* 3. Humidity & Wind Row */}
        <div className="my-2 flex items-center justify-between px-2 font-mono text-xs font-semibold uppercase tracking-wide text-[#a6a6ad]">
          <span>Humidity: {humidity}%</span>
          <span>Wind: {windSpeed} Km/h</span>
        </div>

        {/* 4. Bottom 7-Day Forecast Pills */}
        <div className="grid grid-cols-7 gap-1.5">
          {weeklyForecast.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              className="flex h-20 flex-col items-center justify-between rounded-full border border-white/5 bg-gradient-to-b from-[#242429] to-[#121316] py-2 shadow-sm transition-colors hover:border-[#f0a63d]/30"
            >
              <span className="text-[10px] font-medium text-[#a6a6ad]">
                {item.day}
              </span>

              <div className="flex items-center justify-center">
                {renderIcon(item.type, "size-4 sm:size-5")}
              </div>

              <span className="font-mono text-xs font-semibold text-[#f3f3f2]">
                {item.temp}°
              </span>
            </motion.div>
          ))}
        </div>

        {/* 5. AI Headline/Note (Keeps original intelligence summary) */}
        {(brief?.weather_headline || brief?.weather_note) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2.5 rounded-xl border border-[rgba(240,166,61,0.25)] bg-[rgba(240,166,61,0.08)] p-2"
          >
            {brief?.weather_headline && (
              <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-bold text-[#f0a63d]">
                {isRainy ? <CloudRain className="size-3 text-[#5b9dee]" /> : <Sun className="size-3 text-[#f0a63d]" />}
                {brief.weather_headline}
              </div>
            )}
            {brief?.weather_note && (
              <p className="text-[10px] leading-relaxed text-[#a6a6ad]">
                {brief.weather_note}
              </p>
            )}
          </motion.div>
        )}

      </div>
    </CardGlow>
  );
}