import { Panel } from "./Panel";
import { getDestination } from "@/lib/dashboard-data";

export function DestinationHeader({ city, brief }) {
  const d = getDestination(city);
  const liveTemp =
    brief?.weather?.temp != null ? `${brief.weather.temp}°C` : d.temp;
  const liveCurrency = brief?.code
    ? `${brief.currencyName || brief.code} (${brief.code})`
    : d.currency;
  const liveName = brief?.city
    ? `${brief.city}${brief.country ? `, ${brief.country}` : ""}`
    : d.name;

  const stats = [
    { label: "Safety score", value: d.safety, color: "text-[#e5484a]" },
    { label: "Active alerts", value: d.alerts, color: "text-[#f0a63d]" },
    { label: "Cost of living", value: d.cost, color: "text-[#3ecf8e]" },
    { label: "Right now", value: liveTemp, color: "text-[#f3f3f2]" },
  ];

  return (
    <Panel>
      <div className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden px-7 py-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_90%_at_0%_50%,rgba(229,72,74,0.14),transparent_62%)]" />
        <div className="relative flex items-center gap-4">
          <span className="text-4xl">{d.flag}</span>
          <div>
            <h1 className="text-[1.45rem] font-bold tracking-tight">{liveName}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#a6a6ad]">
              {d.region !== "Unknown" ? d.region : brief?.country || "—"}
              <span className="size-0.5 rounded-full bg-[#68686f]" />
              {liveCurrency}
              <span className="size-0.5 rounded-full bg-[#68686f]" />
              {d.tz}
              <span className="size-0.5 rounded-full bg-[#68686f]" />
              {d.language}
            </p>
          </div>
        </div>
        <div className="relative flex flex-wrap items-center gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="min-w-[82px] rounded-lg border border-white/10 bg-[#141418] px-4 py-2.5 text-center"
            >
              <div className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-[#68686f]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}