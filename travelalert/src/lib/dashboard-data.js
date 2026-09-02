export const destinationMeta = {
  Bangkok: {
    flag: "🇹🇭",
    name: "Bangkok, Thailand",
    region: "Southeast Asia",
    currency: "Thai Baht (THB)",
    tz: "GMT+7",
    language: "Thai",
    safety: "6.8",
    alerts: "12",
    cost: "Low",
    temp: "32°C",
  },
};

export const alerts = [
  {
    name: "Tuk-Tuk Free Temple Tour",
    level: "high",
    badge: "High risk",
    desc: "Driver offers a free city tour, then takes you to gem or tailor shops with extreme pressure to buy, averaging $200+ per victim.",
    avoid: "Refuse all free tour offers. Use the Grab app only.",
    source: "r/solotravel · reported 4× this week",
  },
  {
    name: "Taxi No-Meter Scam",
    level: "medium",
    badge: "Medium",
    desc: "Driver claims the meter is broken, then charges 3 to 5× fair price, especially from Suvarnabhumi airport late at night.",
    avoid: "Insist on the meter or book Grab before leaving arrivals.",
    source: "r/ThailandTourism · reported 7× this week",
  },
  {
    name: "Or Tor Kor Market, Safe Pick",
    level: "low",
    badge: "Tip",
    desc: "The safest, highest quality street food in Bangkok. Local prices, excellent hygiene, open mornings until 2pm.",
    avoid: "Best time is 7 to 10am. Avoid the tourist food courts nearby.",
    source: "r/solotravel · 847 upvotes",
  },
];

export const tips = [
  {
    icon: "taxi",
    title: "Transport, always use Grab",
    desc: "Fixed prices, tracked rides, no negotiation. Airport to city is roughly 280 THB versus 600+ with street taxis.",
    saving: "Saves about $9 per airport ride",
  },
  {
    icon: "food",
    title: "Food, Or Tor Kor Market",
    desc: "The safest, highest quality street food. Local prices, excellent variety. Avoid the tourist food courts nearby.",
    saving: "50% cheaper than tourist restaurants",
  },
  {
    icon: "money",
    title: "Money, Kasikorn ATM only",
    desc: "Lowest foreign card fees in Thailand. Superrich exchange booths on Silom give the best cash rates.",
    saving: "Saves $4 to $8 per withdrawal",
  },
];

export const recent = [
  { name: "Fake Parking Attendant Scam", dest: "Bali, Indonesia · Tanah Lot Temple", level: "High", time: "2h ago", tone: "danger" },
  { name: "Currency Shortchanging at Money Changers", dest: "Hanoi, Vietnam · Old Quarter", level: "Medium", time: "4h ago", tone: "warning" },
  { name: "Ben Thanh Market, Safe for Food", dest: "Ho Chi Minh City, Vietnam", level: "Tip", time: "6h ago", tone: "safe" },
  { name: "Bracelet Gifting Scam, New Reports", dest: "Rome, Italy · Trevi Fountain area", level: "High", time: "8h ago", tone: "danger" },
  { name: "ATM Skimming Device Found", dest: "Prague, Czech Republic · Old Town Square", level: "High", time: "12h ago", tone: "info" },
];

export const cities = [
  { flag: "🇹🇭", name: "Bangkok", score: "6.8", tone: "ok" },
  { flag: "🇮🇩", name: "Bali", score: "7.1", tone: "ok" },
  { flag: "🇻🇳", name: "Hanoi", score: "7.4", tone: "ok" },
  { flag: "🇯🇵", name: "Tokyo", score: "9.1", tone: "good" },
  { flag: "🇰🇭", name: "Siem Reap", score: "6.5", tone: "ok" },
  { flag: "🇮🇹", name: "Rome", score: "7.0", tone: "ok" },
  { flag: "🇪🇸", name: "Barcelona", score: "6.9", tone: "ok" },
  { flag: "🇲🇾", name: "Kuala Lumpur", score: "8.2", tone: "good" },
  { flag: "🇸🇬", name: "Singapore", score: "9.4", tone: "good" },
  { flag: "🇨🇿", name: "Prague", score: "7.3", tone: "ok" },
  { flag: "🇳🇵", name: "Kathmandu", score: "6.8", tone: "ok" },
  { flag: "🇱🇰", name: "Colombo", score: "7.0", tone: "ok" },
];