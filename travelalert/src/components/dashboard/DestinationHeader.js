import { Panel } from "./Panel";
import { getDestination } from "@/lib/dashboard-data";

export function DestinationHeader({ city, brief, alertCount }) {
  const d = getDestination(city);
  const liveTemp =
    brief?.weather?.temp != null ? `${brief.weather.temp}°C` : d.temp;
  const liveCurrency = brief?.code
    ? `${brief.currencyName || brief.code} (${brief.code})`
    : d.currency;
  const liveName = brief?.city
    ? `${brief.city}${brief.country ? `, ${brief.country}` : ""}`
    : d.name;

  const safetyNum = Number(d.safety);
  const safetyColor =
    safetyNum >= 8
      ? "text-[#3ecf8e]"
      : safetyNum >= 6.5
        ? "text-[#f0a63d]"
        : "text-[#e5484a]";

  const stats = [
    { label: "Safety score", value: d.safety, color: safetyColor },
    {
      label: "Active alerts",
      value: alertCount != null ? String(alertCount) : d.alerts,
      color: "text-[#f0a63d]",
    },
    { label: "Cost of living", value: d.cost, color: "text-[#3ecf8e]" },
    { label: "Right now", value: liveTemp, color: "text-[#f3f3f2]" },
  ];

  return (
    <Panel>
      <div className="relative overflow-hidden px-5 py-5 sm:px-7 sm:py-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_90%_at_0%_50%,rgba(229,72,74,0.14),transparent_62%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{d.flag}</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-[1.45rem]">
                {liveName}
              </h1>
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

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="min-w-0 rounded-lg border border-white/10 bg-[#141418] px-3 py-2.5 text-center"
              >
                <div className={`font-mono text-lg font-bold sm:text-xl ${s.color}`}>
                  {s.value}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-[#68686f]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}