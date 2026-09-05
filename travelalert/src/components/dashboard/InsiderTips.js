import { Lock, Moon, ShieldHalf, Wallet } from "lucide-react";
import { Panel } from "./Panel";

export function InsiderTips({ tips = [], loading, city, plan = "free" }) {
  const isPro = plan === "pro" || plan === "lifetime";
  const rows = tips.map((t) => ({
    title: t.name || t.title,
    desc: t.description || t.desc,
    saving: t.avoid || t.saving,
  }));
  const visible = isPro ? rows : rows.slice(0, 3);
  const locked = isPro ? [] : rows.slice(3);
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="size-1.5 rounded-full bg-[#3ecf8e]" />
          Insider tips
        </div>
        <span className="font-mono text-[11px] text-[#68686f]">
          {loading ? "LOADING" : `${city.toUpperCase()} · ${rows.length} TIPS`}
        </span>
      </div>

      <div>
        {loading && (
          <p className="px-4 py-3 text-xs text-[#a6a6ad]">
            Loading {city} tips…
          </p>
        )}

        {!loading && rows.length === 0 && (
          <p className="px-4 py-3 text-xs text-[#a6a6ad]">
            No live tips for {city} yet.
          </p>
        )}

        {!loading &&
          rows.map((t) => (
            <div
              key={t.title}
              className="flex items-start gap-3 border-b border-white/10 px-4 py-3"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#141418] text-[#e5484a]">
                <Wallet className="size-3.5" />
              </div>
              <div>
                <div className="text-[13px] font-bold">{t.title}</div>
                <p className="mt-0.5 text-xs leading-relaxed text-[#a6a6ad]">
                  {t.desc}
                </p>
                {t.saving && (
                  <p className="mt-1 flex items-start gap-1 text-[11px] font-semibold text-[#3ecf8e]">
                    <ShieldHalf className="mt-0.5 size-3 shrink-0" />
                    {t.saving}
                  </p>
                )}
              </div>
            </div>
          ))}

        <div className="relative flex items-center gap-3 border-t border-white/10 px-4 py-3 opacity-40">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10">
            <Moon className="size-3.5" />
          </div>
          <p className="flex-1 text-xs text-[#a6a6ad] blur-[2.5px]">
            More {city} tips unlock on Pro.
          </p>
          <Lock className="absolute right-4 size-3.5 text-[#68686f]" />
        </div>
      </div>
    </Panel>
  );
}