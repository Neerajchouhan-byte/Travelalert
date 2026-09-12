"use client";

import {
  Calendar,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";

/** Pick the right icon for the current conditions (WMO code). */
function nowIcon(code) {
  const cls = "size-10 text-[#e5283b] dark:text-[#f87171]";
  if (code == null) return <CloudRain className={cls} />;
  if (code <= 1) return <Sun className="size-10 text-amber-500" />;
  if (code <= 3) return <CloudSun className="size-10 text-amber-500" />;
  if (code <= 48) return <CloudFog className={cls} />;
  if (code <= 67 || (code >= 80 && code <= 82))
    return <CloudRain className={cls} />;
  if (code <= 77 || (code >= 85 && code <= 86))
    return <CloudSnow className={cls} />;
  return <CloudLightning className={cls} />;
}

export function Weather7DayCard({ brief }) {
  const forecast = Array.isArray(brief?.forecast) ? brief.forecast : [];

  if (forecast.length === 0) {
    return (
      <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black tracking-tight text-zinc-900 sm:text-lg dark:text-white">
            7-Day Weather
          </h3>
          <Calendar className="size-4 text-zinc-400 dark:text-zinc-500" />
        </div>
        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          Forecast unavailable for this destination.
        </p>
      </div>
    );
  }

  const renderIcon = (type, isHighlighted = false) => {
    if (type === "sun") return <Sun className="size-4 text-amber-500" />;
    if (type === "thunder")
      return <CloudLightning className="size-4 text-amber-500" />;
    if (type === "partly-cloudy")
      return <CloudSun className="size-4 text-amber-500" />;
    return (
      <CloudRain
        className={`size-4 ${
          isHighlighted ? "text-white" : "text-zinc-400 dark:text-zinc-500"
        }`}
      />
    );
  };

  function tempLabel(f) {
    if (f.temp == null) return "—";
    return `${f.temp}°`;
  }

  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black tracking-tight text-zinc-900 sm:text-lg dark:text-white">
          7-Day Weather
        </h3>
        <Calendar className="size-4 text-zinc-400 dark:text-zinc-500" />
      </div>

      <div className="mt-4 hidden space-y-1.5 md:block">
        {forecast.map((f, i) => {
          const isToday = f.day === "Today";

          if (isToday) {
            return (
              <div
                key={f.day + i}
                className="flex items-center justify-between rounded-xl bg-[#e5283b] px-3.5 py-2.5 font-bold text-white shadow-xs"
              >
                <span className="font-mono text-xs uppercase">{f.day}</span>
                {renderIcon(f.type, true)}
                <span className="font-mono text-xs">{tempLabel(f)}</span>
              </div>
            );
          }

          return (
            <div
              key={f.day + i}
              className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              <span className="font-mono uppercase text-zinc-400 dark:text-zinc-500">
                {f.day}
              </span>
              {renderIcon(f.type)}
              <span className="font-mono">{tempLabel(f)}</span>
            </div>
          );
        })}
      </div>

      <div className="no-scrollbar mt-4 flex items-center gap-2.5 overflow-x-auto pb-1 md:hidden">
        {forecast.map((f, i) => {
          const isToday = f.day === "Today";

          return (
            <div
              key={f.day + i}
              className={`flex h-36 w-24 shrink-0 flex-col items-center justify-between rounded-2xl p-3 text-center transition-all ${
                isToday
                  ? "border-2 border-red-300 bg-red-50/90 dark:border-red-600/50 dark:bg-red-950/40"
                  : "border border-zinc-200/90 bg-white dark:border-white/10 dark:bg-[#16161b]"
              }`}
            >
              <span
                className={`font-mono text-xs font-black uppercase ${
                  isToday
                    ? "text-[#e5283b] dark:text-[#f87171]"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {f.day}
              </span>

              <div className="my-auto">{renderIcon(f.type, false)}</div>

              <div>
                <p className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {tempLabel(f)}
                </p>
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
  const hasTemp = w && typeof w.temp === "number" && !Number.isNaN(w.temp);

  if (!hasTemp) {
    return (
      <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          NOW
        </p>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Current conditions unavailable.
        </p>
      </div>
    );
  }

  const rainProb =
    typeof w.rain_chance === "number" ? w.rain_chance : null;
  const feels = typeof w.feels === "number" ? w.feels : null;
  const humidity = typeof w.humidity === "number" ? w.humidity : null;
  const condition = w.condition || null;
  const uv = typeof w.uv === "number" ? w.uv : null;
  const wind = typeof w.wind_kph === "number" ? w.wind_kph : null;
  const daylight = w.daylight || null;

  const detailParts = [];
  if (feels != null) detailParts.push(`Feels like ${feels}°C`);
  if (humidity != null) detailParts.push(`Humidity ${humidity}%`);

  const hasExtraStats = uv != null || wind != null || Boolean(daylight);

  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        NOW
      </p>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
          {w.temp}°C
        </span>
        {nowIcon(w.code)}
      </div>

      {condition && (
        <p className="mt-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {condition}
        </p>
      )}

      {rainProb != null && (
        <p className="mt-2 text-xs font-bold text-[#e5283b] dark:text-[#f87171]">
          {rainProb}% rain probability
        </p>
      )}

      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
        {detailParts.length ? detailParts.join(" · ") : "—"}
      </p>

      {hasExtraStats && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-zinc-100 pt-2 dark:border-white/5">
          {uv != null && (
            <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
              UV{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {uv}
              </span>
            </span>
          )}
          {wind != null && (
            <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
              WIND{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {wind} kph
              </span>
            </span>
          )}
          {daylight && (
            <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
              DAY{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {daylight}
              </span>
            </span>
          )}
        </div>
      )}
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