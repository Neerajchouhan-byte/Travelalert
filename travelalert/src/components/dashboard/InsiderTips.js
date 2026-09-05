"use client";

import { useEffect, useState } from "react";
import { Lock, ShieldHalf, Wallet } from "lucide-react";
import { Panel } from "./Panel";
import { supabase } from "@/lib/supabase";
import { checkoutUrl } from "@/lib/checkout";

export function InsiderTips({ tips = [], loading, city, plan = "free" }) {
  const isPro = plan === "pro" || plan === "lifetime";
  const rows = tips.map((t) => ({
    title: t.name || t.title,
    desc: t.description || t.desc,
    saving: t.avoid || t.saving,
  }));
  const visible = isPro ? rows : rows.slice(0, 3);
  const locked = isPro ? [] : rows.slice(3);

  const [upgradeHref, setUpgradeHref] = useState(
    process.env.NEXT_PUBLIC_CHECKOUT_PRO || "/login"
  );

  useEffect(() => {
    let on = true;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!on || !user) return;
      setUpgradeHref(checkoutUrl("pro", user.id, user.email));
    })();
    return () => {
      on = false;
    };
  }, []);

  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="size-1.5 rounded-full bg-[#3ecf8e]" />
          Insider tips
        </div>
        <span className="font-mono text-[11px] text-[#68686f]">
          {loading ? "LOADING" : `${(city || "").toUpperCase()} · ${rows.length} TIPS`}
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
          visible.map((t) => (
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

        {!loading &&
          locked.map((t) => (
            <div
              key={t.title}
              className="relative flex items-start gap-3 border-b border-white/10 px-4 py-3"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 opacity-40">
                <Lock className="size-3.5" />
              </div>
              <div className="flex-1 select-none blur-[3px]">
                <div className="text-[13px] font-bold">{t.title}</div>
                <p className="mt-0.5 text-xs text-[#a6a6ad]">{t.desc}</p>
              </div>
              <Lock className="absolute right-4 top-4 size-3.5 text-[#68686f]" />
            </div>
          ))}

        {!isPro && locked.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-xs font-semibold text-[#5b9dee]">
              {locked.length} more tips on Pro
            </span>
            <a
              href={upgradeHref}
              className="inline-flex h-7 items-center rounded-full bg-[#5b9dee] px-3 text-xs font-semibold text-[#071426]"
            >
              Upgrade Pro
            </a>
          </div>
        )}
      </div>
    </Panel>
  );
}