const items = [
  ["Tuk-Tuk Scam", "Bangkok", "$200"],
  ["Fake Parking", "Bali", "$15"],
  ["Gem Store Scam", "Bangkok", "$300"],
  ["Motorbike Damage", "Bali", "$150"],
  ["ATM Skimming", "Prague", "$400"],
  ["Bracelet Scam", "Rome", "$20"],
  ["Taxi No Meter", "Hanoi", "$25"],
  ["Fake Monk", "Bangkok", "$50"],
];

const trackItems = [...items, ...items];

export default function Marquee() {
  return (
    <div className="marquee-container w-full border-y border-zinc-200/80 bg-[#edece6]/60 py-3 overflow-hidden dark:border-white/5 dark:bg-[#101013]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-2 border-r border-zinc-300 pr-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[#e5283b] dark:border-white/10">
          <span className="size-1.5 rounded-full bg-[#e5283b]" />
          <span>LIVE SCAM REPORTS · UPDATED HOURLY</span>
        </div>

        <div className="no-scrollbar overflow-hidden">
          <div className="animate-ticker flex w-max items-center gap-6">
            {trackItems.map(([name, city, amount], index) => (
              <span
                key={`${name}-${city}-${index}`}
                className="flex items-center gap-2 whitespace-nowrap font-mono text-xs text-zinc-600 dark:text-zinc-400"
              >
                <b className="font-semibold text-zinc-900 dark:text-zinc-200">{name}</b>
                <span className="text-zinc-400 dark:text-zinc-600">·</span>
                <span>{city}</span>
                <span className="text-zinc-400 dark:text-zinc-600">·</span>
                <span>
                  avg loss <b className="text-[#e5283b]">{amount}</b>
                </span>
                <span className="ml-4 text-zinc-300 dark:text-zinc-700">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}