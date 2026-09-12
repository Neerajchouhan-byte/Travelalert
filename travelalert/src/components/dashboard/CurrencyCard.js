"use client";

import { TriangleAlert } from "lucide-react";

export function UsdConversionCard({ brief }) {
  const code = brief?.code || null;
  const usd =
    brief?.usd != null ? Number(brief.usd).toLocaleString() : null;

  if (!code || usd == null) {
    return (
      <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          USD → LOCAL
        </p>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Exchange rate unavailable for this destination.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
        USD → {code}
      </p>

      <p className="mt-1 font-mono text-xl font-black tracking-tight text-zinc-900 sm:text-2xl dark:text-white">
        1 USD = {usd} {code}
      </p>

      <div className="mt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-3.5 py-1 text-xs font-bold text-[#b45309] dark:bg-[#2b1d0c] dark:text-[#fbbf24]">
          <TriangleAlert className="size-3.5" />
          Decline ATM DCC
        </span>
      </div>
    </div>
  );
}

export function ExchangeRateCard({ brief }) {
  const code = brief?.code || null;
  const usd = typeof brief?.usd === "number" ? brief.usd : null;
  const eur = typeof brief?.eur === "number" ? brief.eur : null;
  const inr = typeof brief?.inr === "number" ? brief.inr : null;

  if (!code || usd == null) {
    return (
      <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-black tracking-tight text-zinc-900 dark:text-white">
            Exchange Rate
          </h4>
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Reference rates unavailable for this destination.
        </p>
      </div>
    );
  }

  // Every rate below comes from the live /api/city-brief response:
  //   usd = local per 1 USD,  eur = local per 1 EUR,  inr = local per 1 INR.
  // No fabricated history, no invented percentages.
  const format = (v) =>
    v == null
      ? null
      : v.toLocaleString("en-US", { maximumFractionDigits: 4 });

  const rows = [
    { base: "USD", value: usd },
    { base: "EUR", value: eur },
    { base: "INR", value: inr },
  ].filter((r) => r.value != null);

  const quickAmounts = [10, 50, 100];

  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-black tracking-tight text-zinc-900 dark:text-white">
          Exchange Rate
        </h4>
        <span className="font-mono text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
          → {code}
        </span>
      </div>

      <p className="mt-0.5 font-mono text-xs text-zinc-400 dark:text-zinc-500">
        Reference cross-rates
      </p>

      <div className="mt-3 divide-y divide-zinc-100 border-t border-zinc-100 dark:divide-white/5 dark:border-white/5">
        {rows.map((r) => (
          <div
            key={r.base}
            className="flex items-center justify-between py-2.5"
          >
            <span className="font-mono text-xs font-bold text-zinc-500 dark:text-zinc-400">
              1 {r.base}
            </span>
            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
              {format(r.value)} {code}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Quick convert from USD
      </p>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {quickAmounts.map((amount) => (
          <div
            key={amount}
            className="rounded-xl bg-zinc-50 px-2.5 py-2 dark:bg-white/[0.04]"
          >
            <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
              ${amount}
            </p>
            <p className="mt-0.5 font-mono text-[11px] font-bold text-zinc-900 dark:text-white">
              {format(amount * usd)}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10px] text-zinc-400 dark:text-zinc-500">
        Source: open.er-api.com · refreshed hourly
      </p>
    </div>
  );
}

export function CurrencyCard({ brief }) {
  return (
    <div className="space-y-4">
      <UsdConversionCard brief={brief} />
      <ExchangeRateCard brief={brief} />
    </div>
  );
}