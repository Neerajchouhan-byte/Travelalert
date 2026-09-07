const bangkokAlerts = [
  {
    title: 'The "Grand Palace is Closed" Gem Shop Loop',
    description:
      "A friendly stranger near the Grand Palace may tell you the temple is closed and offer a cheap tuk-tuk tour instead. The driver takes you to commission-paying gem and souvenir shops, where high-pressure sales tactics and inflated prices do the real work.",
    prevention:
      "Ignore unsolicited closure claims, check the official entrance yourself, and use a metered taxi or a ride-hailing app. Do not enter a shop because a driver says it is government-approved or a once-a-year sale.",
  },
  {
    title: "Suvarnabhumi & Don Mueang Airport Unmetered Taxi Trap",
    description:
      "Drivers waiting away from the official airport taxi queue may offer a fixed fare that sounds convenient, then add tolls, luggage charges, or an airport surcharge. Some refuse the meter altogether once you are on the road.",
    prevention:
      "Use the official airport taxi counter, insist on the meter before leaving, and keep small baht notes for tolls. Photograph the taxi number and use the airport rail link or a reputable ride-hailing pickup when practical.",
  },
  {
    title: "The 20-Baht Tuk-Tuk Shopping Detour",
    description:
      "An unusually cheap tuk-tuk ride is often subsidized by shops that pay the driver for each tourist visit. A short trip can turn into multiple tailor, gem, or souvenir stops, with pressure to buy before the driver takes you to your actual destination.",
    prevention:
      "Agree on the exact destination and price before boarding, decline all shopping stops, and treat a 20-baht all-day tour as a warning sign. For direct travel, compare the fare with BTS, MRT, or a metered taxi.",
  },
  {
    title: "Chao Phraya Riverboat Pier / Tourist Boat Ticket Surcharge",
    description:
      "At busy river piers, unofficial sellers can steer visitors toward an expensive tourist boat or private charter while presenting it as the only available service. Tickets may be quoted per person, per stop, or with surprise fees after boarding.",
    prevention:
      "Use the official ticket booth, look for the public orange-flag boat signs, and confirm the route and total price in writing before paying. Never hand over your passport or board a private boat because a tout says the public service has stopped.",
  },
  {
    title: 'Patpong / Nana Bar "Free Show" Drink Bill Extortion',
    description:
      "Promoters invite visitors to a bar with promises of a free show or cheap drinks. Once seated, the menu may be withheld and the final bill can include expensive drinks, performances, and unexplained service charges, backed by intimidating staff.",
    prevention:
      "Do not follow street promoters into venues advertising a free show. If you enter, ask for a menu and total prices before ordering, keep your own tab, and leave immediately if staff refuse to show the bill. Contact tourist police if you are threatened.",
  },
  { title: "Jet Ski Damage Claim Extortion", description: "Operators may claim that pre-existing damage appeared after you returned a jet ski and demand a large cash payment.", gated: true },
  { title: 'Fake Police "Passport / Drug Check"', description: "A person posing as police may demand your passport, search your wallet, or threaten arrest unless you pay an on-the-spot fine.", gated: true },
  { title: "Tailor Shop Suit Scam", description: "A fast-moving tailor pitch can lead to deposits for poor-quality suits, missed delivery promises, or goods that do not match the agreed fabric and measurements.", gated: true },
  { title: "Spilled Bird Seed Scam at Temples", description: "Scammers create a distraction with birds or spilled seed, then demand payment for an unsolicited photo, feeding experience, or cleanup.", gated: true },
  { title: "Rigged Muay Thai / Street Game Bets", description: "A staged game or match invitation can draw you into a betting scheme where planted participants win and pressure you to keep raising your stake.", gated: true },
  { title: "Fake Floating Market Private Longtail Boat Shakedown", description: "A private boat offer may become an expensive, unplanned tour with extra pier, fuel, waiting, or return charges demanded at the end.", gated: true },
  { title: "Hotel Booking Interception by Fake Tour Counters", description: "A booth or caller may impersonate your hotel or booking service, claim your reservation is unavailable, and redirect you to a more expensive room or transfer.", gated: true },
];

export const scamCities = {
  bangkok: {
    slug: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    alerts: bangkokAlerts,
    faqs: [
      { question: "What are the most common tourist scams in Bangkok?", answer: "Common warnings include the Grand Palace closure story, unmetered airport taxis, cheap tuk-tuk shopping detours, riverboat ticket surcharges, and free-show drink bills." },
      { question: "How can I avoid taxi scams in Bangkok?", answer: "Use the official airport taxi queue, insist on the meter, confirm the destination before departure, and use the BTS, MRT, or a reputable ride-hailing service when possible." },
      { question: "Is Bangkok safe for tourists in 2026?", answer: "Bangkok is visited safely by millions of travelers, but visitors should use normal precautions, verify prices before paying, and leave any situation involving threats or coercion." },
    ],
  },
};

export function getScamCity(slug) {
  return scamCities[String(slug || "").toLowerCase()];
}