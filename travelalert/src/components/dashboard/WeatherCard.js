"use client";

import { Calendar, CloudRain, Sun, CloudSun, CloudLightning } from "lucide-react";

export function Weather7DayCard({ brief }) {
  const forecast = brief?.forecast || [
    { day: "MON", temp: 29, low: 24, type: "rain" },
    { day: "TUE", temp: 29, low: 24, type: "rain", active: true, rain: "88% rain" },
    { day: "WED", temp: 29, low: 24, type: "rain" },
    { day: "THU", temp: 30, low: 24, type: "rain" },
    { day: "FRI", temp: 30, low: 24, type: "rain" },
    { day: "SAT", temp: 31, low: 24, type: "sun" },
    { day: "SUN", temp: 31, low: 24, type: "sun" },
  ];

  const renderIcon = (type, isRed = false) => {
    if (type === "sun") {
      return <Sun className="size-4 text-amber-500" />;
    }
    if (type === "thunder") {
      return <CloudLightning className="size-4 text-amber-500" />;
    }
    if (type === "partly-cloudy") {
      return <CloudSun className="size-4 text-amber-500" />;
    }
    return (
      <CloudRain
        className={`size-4 ${isRed ? "text-white" : "text-zinc-400 dark:text-zinc-500"}`}
      />
    );
  };

  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black tracking-tight text-zinc-900 sm:text-lg dark:text-white">
          7-Day Weather
        </h3>
        <Calendar className="size-4 text-zinc-400 dark:text-zinc-500" />
      </div>

      {/* Desktop & Tablet: Vertical List */}
      <div className="mt-4 hidden space-y-2 md:block">
        {forecast.map((f, i) => {
          const isActive = f.active || i === 1;

          if (isActive) {
            return (
              <div
                key={f.day + i}
                className="flex items-center justify-between rounded-xl bg-[#e5283b] px-3.5 py-2.5 font-bold text-white shadow-xs dark:bg-[#e5484a]"
              >
                <span className="font-mono text-xs uppercase">{f.day}</span>
                {renderIcon(f.type, true)}
                <span className="font-mono text-xs">
                  {f.temp}° / {f.low || f.temp - 5}°
                </span>
                <span className="text-[10px] font-medium text-white/90">
                  {f.rain || "88% rain"}
                </span>
              </div>
            );
          }

          return (
            <div
              key={f.day + i}
              className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              <span className="font-mono text-zinc-400 uppercase dark:text-zinc-500">
                {f.day}
              </span>
              {renderIcon(f.type)}
              <span className="font-mono">
                {f.temp}° / {f.low || f.temp - 5}°
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: Horizontal Carousel */}
      <div className="no-scrollbar mt-4 flex items-center gap-2.5 overflow-x-auto pb-1 md:hidden">
        {forecast.map((f, i) => {
          const isActive = f.active || i === 1;

          return (
            <div
              key={f.day + i}
              className={`flex h-32 w-20 shrink-0 flex-col items-center justify-between rounded-2xl p-3 text-center transition-all ${
                isActive
                  ? "border-2 border-red-300 bg-red-50/90 dark:border-red-600/50 dark:bg-red-950/40"
                  : "border border-zinc-200/90 bg-white dark:border-white/10 dark:bg-[#16161b]"
              }`}
            >
              <span
                className={`font-mono text-xs font-black uppercase ${
                  isActive
                    ? "text-[#e5283b] dark:text-[#f87171]"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {f.day}
              </span>

              {renderIcon(f.type, false)}

              <div>
                <p className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {f.temp}° / {f.low || f.temp - 5}°
                </p>
                {isActive && (
                  <p className="text-[10px] font-bold text-[#e5283b] dark:text-[#f87171]">
                    {f.rain || "88% rain"}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WeatherNowCard({ brief }) {
  const w = brief?.weather;
  const temp = w?.temp ?? 29;
  const rainProb = w?.rain_chance ?? 88;
  const feels = w?.feels ?? 32;
  const humidity = w?.humidity ?? 81;

  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Now
      </p>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
          {temp}°C
        </span>
        <CloudRain className="size-9 text-[#e5283b] dark:text-[#f87171]" />
      </div>

      <p className="mt-3 text-xs font-bold text-[#e5283b] dark:text-[#f87171]">
        {rainProb}% rain probability
      </p>

      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
        Feels like {feels}°C · Humidity {humidity}%
      </p>
    </div>
  );
}

export function WeatherCard({ brief }) {
  return (
    <div className="space-y-4">
      <Weather7DayCard brief={brief} />
      <WeatherNowCard brief={brief} />
    </div>
  );
}