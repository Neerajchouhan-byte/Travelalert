import { useEffect, useState } from "react";
import { ShieldHalf } from "lucide-react";
import { Panel } from "./Panel";
import { ExpandableCard } from "./ExpandableCard";
import { supabase } from "@/lib/supabase";
import { checkoutUrl } from "@/lib/checkout";

export function ScamAlerts({
  alerts = [],
  loading,
  plan = "free",
  lockedCount = 0,
}) {
  const isPro = plan === "pro" || plan === "lifetime";
  const locked = isPro ? 0 : lockedCount;

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
      {/* header unchanged */}
      <div className="space-y-2 p-3">
        {loading && (
          <p className="px-1 py-2 text-xs text-[#a6a6ad]">Loading alerts…</p>
        )}

        {!loading && alerts.length === 0 && (
          <p className="px-1 py-2 text-xs text-[#a6a6ad]">No live alerts yet.</p>
        )}

        {!loading &&
          alerts.map((a, i) => {
            const level = a.severity || a.level || "medium";
            return (
              <ExpandableCard
                key={(a.name || "alert") + i}
                title={a.name}
                badge={a.badge || level}
                preview={a.description || a.desc}
                accent={level}
              >
                <p className="text-xs leading-relaxed text-[#a6a6ad]">
                  {a.description || a.desc}
                </p>
                {a.avoid && (
                  <p className="mt-2 flex items-start gap-2 text-xs font-semibold text-[#3ecf8e]">
                    <ShieldHalf className="mt-0.5 size-3 shrink-0" />
                    {a.avoid}
                  </p>
                )}
              </ExpandableCard>
            );
          })}

        {!loading &&
          Array.from({ length: locked }).map((_, i) => (
            <ExpandableCard
              key={"lock-" + i}
              title="Pro alert"
              preview="Upgrade to unlock this scam pattern."
              accent="medium"
              locked
            />
          ))}

        {!isPro && locked > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border border-[rgba(91,157,238,0.38)] bg-[rgba(91,157,238,0.13)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-semibold text-[#5b9dee]">
              {locked} more alerts on Pro
            </span>
            <a
              href={upgradeHref}
              className="inline-flex h-9 min-h-9 items-center justify-center rounded-full bg-[#5b9dee] px-3 text-xs font-semibold text-[#071426]"
            >
              Upgrade Pro
            </a>
          </div>
        )}
      </div>
    </Panel>
  );
}