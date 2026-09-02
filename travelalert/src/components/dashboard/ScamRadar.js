import { Panel } from "./Panel";

export function ScamRadar() {
  return (
    <Panel>
      <div className="p-5">
        <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#68686f]">
          Live scam radar, last 7 days
        </div>
        <div className="relative mx-auto mb-4 aspect-square w-[118px]">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-[16%] rounded-full border border-white/10" />
          <div className="absolute inset-[34%] rounded-full border border-white/10" />
          <div className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(229,72,74,0.14)_30deg,transparent_78deg)]" />
          <div className="absolute inset-[44%] rounded-full border border-white/16 bg-[#101013]" />
        </div>
        <div className="space-y-2 text-xs text-[#a6a6ad]">
          <Row color="bg-[#e5484a]" label="Scam reports" count="18" />
          <Row color="bg-[#f0a63d]" label="Warnings" count="12" />
          <Row color="bg-[#3ecf8e]" label="Positive tips" count="17" />
        </div>
      </div>
    </Panel>
  );
}

function Row({ color, label, count }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-1.5 rounded-full ${color}`} />
      <span className="flex-1">{label}</span>
      <span className="font-mono text-[#68686f]">{count}</span>
    </div>
  );
}