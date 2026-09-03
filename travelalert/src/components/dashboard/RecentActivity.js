import { Panel } from "./Panel";

export function RecentActivity({ city, alerts = [], loading }) {
  const rows = alerts.slice(0, 5);

  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="size-1.5 rounded-full bg-[#e5484a]" />
          Recent for {city}
        </div>
      </div>
      <div className="divide-y divide-white/10">
        {loading && (
          <p className="px-5 py-4 text-xs text-[#a6a6ad]">Loading…</p>
        )}
        {!loading && rows.length === 0 && (
          <p className="px-5 py-4 text-xs text-[#a6a6ad]">No live reports yet.</p>
        )}
        {rows.map((a, i) => (
          <div key={a.name + i} className="flex items-start justify-between gap-3 px-5 py-3">
            <div>
              <div className="text-sm font-bold">{a.name}</div>
              <div className="text-[11px] text-[#a6a6ad]">{city}</div>
            </div>
            <span className="font-mono text-[10px] uppercase text-[#68686f]">
              {a.severity}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}