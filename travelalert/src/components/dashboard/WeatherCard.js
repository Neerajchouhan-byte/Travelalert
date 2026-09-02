import { CloudRain, Sun } from "lucide-react";
import { Panel } from "./Panel";

export function WeatherCard() {
  return (
    <Panel>
      <div className="p-5">
        <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#68686f]">
          Current conditions
        </div>
        <div className="mb-1 flex items-baseline gap-2">
          <span className="font-mono text-[1.7rem] font-bold">32°C</span>
          <Sun className="size-5 text-[#f0a63d]" />
        </div>
        <p className="mb-3 text-xs text-[#a6a6ad]">Humidity 78% · Feels like 38°C · UV index high</p>
        <div className="rounded-lg border border-[rgba(240,166,61,0.38)] bg-[rgba(240,166,61,0.13)] p-2.5">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-bold text-[#f0a63d]">
            <CloudRain className="size-3.5" />
            Monsoon season approaching
          </div>
          <p className="text-[11px] leading-relaxed text-[#a6a6ad]">
            Heavy afternoon showers likely. Pack a compact rain jacket. Flash flooding possible near Chatuchak.
          </p>
        </div>
      </div>
    </Panel>
  );
}