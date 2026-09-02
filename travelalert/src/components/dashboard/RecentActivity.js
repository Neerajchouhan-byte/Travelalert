import { Check, CreditCard, Gift, ParkingSquare, ArrowLeftRight } from "lucide-react";
import { Panel } from "./Panel";
import { recent } from "@/lib/dashboard-data";

const icons = {
  danger: Gift,
  warning: ArrowLeftRight,
  safe: Check,
  info: CreditCard,
};

const tones = {
  danger: "bg-[rgba(229,72,74,0.14)] text-[#e5484a]",
  warning: "bg-[rgba(240,166,61,0.13)] text-[#f0a63d]",
  safe: "bg-[rgba(62,207,142,0.13)] text-[#3ecf8e]",
  info: "bg-[rgba(91,157,238,0.13)] text-[#5b9dee]",
};

export function RecentActivity() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <span className="size-2 rounded-full bg-[#5b9dee]" />
          Recent alerts across all destinations
        </h2>
        <span className="text-xs font-semibold text-[#a6a6ad]">View all</span>
      </div>
      <Panel>
        {recent.map((item) => {
          const Icon = item.name.includes("Parking") ? ParkingSquare : icons[item.tone];
          return (
            <div key={item.name} className="flex items-center gap-3 border-b border-white/10 px-5 py-3 last:border-0">
              <div className={`flex size-8 items-center justify-center rounded-md ${tones[item.tone]}`}>
                <Icon className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold">{item.name}</div>
                <div className="truncate text-[11px] text-[#68686f]">{item.dest}</div>
              </div>
              <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${tones[item.tone]}`}>
                {item.level}
              </span>
              <span className="hidden font-mono text-[11px] text-[#68686f] sm:block">{item.time}</span>
            </div>
          );
        })}
      </Panel>
    </section>
  );
}