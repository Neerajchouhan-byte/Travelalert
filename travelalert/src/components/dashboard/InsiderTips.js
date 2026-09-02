import { ArrowLeftRight, Bed, CarTaxiFront, Lock, Moon, UtensilsCrossed, Wallet } from "lucide-react";
import { Panel } from "./Panel";
import { tips } from "@/lib/dashboard-data";

const icons = {
  taxi: CarTaxiFront,
  food: UtensilsCrossed,
  money: ArrowLeftRight,
};

export function InsiderTips() {
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="size-1.5 rounded-full bg-[#3ecf8e]" />
          Insider tips
        </div>
        <span className="font-mono text-[11px] text-[#68686f]">6 TIPS AVAILABLE</span>
      </div>

      <div>
        {tips.map((t) => {
          const Icon = icons[t.icon] || Wallet;
          return (
            <div key={t.title} className="flex items-start gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#141418] text-[#e5484a]">
                <Icon className="size-3.5" />
              </div>
              <div>
                <div className="text-[13px] font-bold">{t.title}</div>
                <p className="mt-0.5 text-xs leading-relaxed text-[#a6a6ad]">{t.desc}</p>
                <p className="mt-1 text-[11px] font-semibold text-[#3ecf8e]">{t.saving}</p>
              </div>
            </div>
          );
        })}

        <LockedTip icon={Bed} text="Best areas to stay in Bangkok, and neighborhoods to avoid completely after dark." />
        <LockedTip icon={Moon} text="Nightlife safety guide, areas to enjoy versus areas that target tourists after midnight." />
      </div>
    </Panel>
  );
}

function LockedTip({ icon: Icon, text }) {
  return (
    <div className="relative flex items-center gap-3 border-t border-white/10 px-4 py-3 opacity-40">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10">
        <Icon className="size-3.5" />
      </div>
      <p className="flex-1 text-xs text-[#a6a6ad] blur-[2.5px]">{text}</p>
      <Lock className="absolute right-4 size-3.5 text-[#68686f]" />
    </div>
  );
}