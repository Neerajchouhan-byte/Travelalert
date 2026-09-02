import { CircleCheck, TriangleAlert } from "lucide-react";
import { Panel } from "./Panel";

export function CurrencyCard() {
  return (
    <Panel>
      <div className="p-5">
        <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#68686f]">
          Live exchange rate
        </div>
        <div className="font-mono text-[1.25rem] font-bold">1 USD = 35.2 THB</div>
        <div className="mt-1 mb-3 text-xs text-[#a6a6ad]">1 INR = 0.42 THB · 1 EUR = 38.1 THB</div>
        <div className="flex items-start gap-2 rounded-lg border border-[rgba(240,166,61,0.38)] bg-[rgba(240,166,61,0.13)] p-2.5">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-[#f0a63d]" />
          <p className="text-[11px] leading-relaxed text-[#a6a6ad]">
            Airport exchange booths offer only 28 THB per USD, that's 20% below fair rate. Avoid completely.
          </p>
        </div>
        <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-[#3ecf8e]">
          <CircleCheck className="size-3.5" />
          Best rate: Superrich exchange (Silom) or Kasikorn ATM
        </p>
      </div>
    </Panel>
  );
}