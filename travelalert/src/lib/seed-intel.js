function item(name, severity, description, avoid) {
  return { name, severity, description, avoid };
}

function tip(name, description, avoid) {
  return { name, description, avoid };
}

const CITY = {
  bangkok: {
    alerts: [
      item("Tuk-tuk free temple tour", "high", "Near the Grand Palace a driver offers a free city tour, then pushes gem or tailor shops.", "Refuse free tours. Use Grab only."),
      item("Airport taxi no meter", "high", "Suvarnabhumi touts quote 800–1200 THB for a ride that is ~280–400 THB on Grab.", "Book Grab before leaving arrivals."),
      item("Gem shop pressure", "high", "Shops pay drivers commission. Prices are often 5–10× wholesale.", "Do not buy gems on a first-day detour."),
      item("Khao San pad thai markup", "medium", "Main-strip stalls charge 3–4× the side-street price.", "Walk one street off Khao San. Check the posted price."),
      item("ATM skimming tourist blocks", "high", "Standalone ATMs near malls and nightlife get skimmers.", "Use an ATM inside a bank branch. Cover the PIN."),
      item("Fake police tourist fine", "high", "Someone in uniform asks to see your cash or passport, then 'fines' you.", "Walk to a real station. Do not hand over your wallet."),
      item("Ping pong show ladyboy scam", "medium", "A friendly stranger leads you to a bar. The bill is huge and bouncers block the door.", "Do not follow strangers to bars. Check the menu first."),
      item("Jet ski damage claim", "medium", "Pattaya / islands: after the ride they invent hull damage and demand cash.", "Photo the jet ski before and after. Pay by card if you must rent."),
      item("Suit commission tailor", "medium", "Same-day cheap suits look fine until the first wash.", "Skip same-day tailors on tourist streets."),
      item("Tuk-tuk meter that is not a meter", "medium", "A box on the dash is not an official meter.", "Agree the price in THB before you sit, or use Grab."),
      item("Temple donation hard sell", "medium", "A 'monk' or helper ties a bracelet then demands a large donation.", "Donate in the official box only. Keep walking."),
      item("Closed temple detour", "medium", "Driver says the palace is closed and reroutes you to a shop.", "Check hours yourself. Get out and walk."),
    ],
    tips: [
      tip("Use Grab from the airport", "Fixed fare beats the curb taxi queue.", "Open Grab before you exit customs."),
      tip("BTS and MRT for the center", "Faster than a tuk-tuk in traffic.", "Buy a Rabbit card if you stay more than 2 days."),
      tip("Pay in THB not USD", "Dynamic conversion adds 3–7%.", "Always choose local currency on the card terminal."),
      tip("Drink bottled water", "Tap water is not for drinking.", "Sealed bottles only."),
      tip("Temple dress code", "Knees and shoulders covered or you pay for a wrap.", "Carry a light scarf."),
      tip("Avoid taxi desks inside the terminal", "Official desks still mark up vs Grab.", "Walk out and book the app."),
      tip("Street food price check", "If there is no posted price, you will overpay.", "Eat where locals are standing."),
      tip("SIM at the airport", "AIS / True kiosks beat hotel rates.", "Passport needed. 7-day tourist SIM is enough."),
      tip("Cash for sois, card for malls", "Small vendors want cash.", "Withdraw once at a bank ATM."),
      tip("Grand Palace go early", "Lines and heat spike after 10am.", "Arrive at opening. Ignore touts at the gate."),
    ],
  },
};

function genericAlerts(city) {
  return [
    item(`Unmetered taxi in ${city}`, "high", `Curb taxis in ${city} quote 3–5× the app price.`, `Use the local ride app. Agree the price before you sit.`),
    item(`Airport transfer markup in ${city}`, "high", `Terminal touts in ${city} sell rides at tourist rates.`, `Book the app after baggage claim. Ignore desks that shout.`),
    item(`ATM skimming in ${city}`, "high", `Standalone ATMs in tourist pockets of ${city} get skimmers.`, `Bank-branch ATM only. Cover the keypad.`),
    item(`Dynamic currency conversion in ${city}`, "medium", `Card machines in ${city} offer to charge USD at a bad rate.`, `Decline DCC. Pay in local currency.`),
    item(`Unofficial tour seller in ${city}`, "high", `A friendly stranger in ${city} walks you to a shop or show with a trap bill.`, `Book tours on official sites. Do not follow the first person who greets you.`),
    item(`Fake official in ${city}`, "high", `Someone claiming to be police or an inspector in ${city} asks for cash.`, `Do not pay in the street. Walk to a real station.`),
    item(`Overpriced restaurant near landmarks in ${city}`, "medium", `Menus without prices near the main sights in ${city} spike the bill.`, `Walk two blocks away. Read the menu first.`),
    item(`Rental deposit trick in ${city}`, "medium", `Bikes, scooters, or jet skis in ${city} come back with invented damage.`, `Photo every panel before you leave.`),
    item(`Helpful parking attendant in ${city}`, "medium", `A vest and a whistle do not mean official parking in ${city}.`, `Use marked lots. Do not hand over the key.`),
    item(`Closed-attraction detour in ${city}`, "medium", `A driver says the site is closed and reroutes you to a shop in ${city}.`, `Check hours on your phone. Get out and walk.`),
    item(`Bracelet or petition scam in ${city}`, "medium", `Someone puts an object in your hand in ${city} then demands money.`, `Hands in pockets. Do not take the object.`),
    item(`Hotel booking copycat site for ${city}`, "medium", `Lookalike URLs clone hotel pages for ${city} stays.`, `Book on the hotel site or a known platform. Check the URL.`),
  ];
}

function genericTips(city) {
  return [
    tip(`Ride app in ${city}`, `App fares beat curb taxis in ${city}.`, `Install it before you land. Enable roaming or eSIM.`),
    tip(`Local currency in ${city}`, `DCC on card machines in ${city} is a silent tax.`, `Tap the local-currency button every time.`),
    tip(`Bank ATMs in ${city}`, `Mall and tourist ATMs in ${city} add fees and risk.`, `Use a machine attached to a bank.`),
    tip(`Drink sealed water in ${city}`, `Do not assume tap water is safe in ${city}.`, `Buy sealed bottles.`),
    tip(`Posted prices in ${city}`, `No posted price usually means tourist price in ${city}.`, `Ask the total before they cook or drive.`),
    tip(`Official tickets in ${city}`, `Street sellers add a cut on attractions in ${city}.`, `Buy at the window or the official site.`),
    tip(`Photo rentals in ${city}`, `Damage claims are common on bikes and scooters in ${city}.`, `Timestamped photos before and after.`),
    tip(`SIM / eSIM on arrival in ${city}`, `Hotel Wi-Fi is late. You need maps at the airport.`, `Buy a tourist eSIM before the flight.`),
    tip(`Small cash in ${city}`, `Markets and street food in ${city} are cash-first.`, `One ATM visit, then spend down.`),
    tip(`Landmark crowds in ${city}`, `Pickpockets work the densest squares in ${city}.`, `Bag in front. Phone not in a back pocket.`),
  ];
}

export function seedIntel(city) {
  const key = (city || "").trim().toLowerCase();
  const hit = Object.keys(CITY).find((k) => key.includes(k));
  const pack = hit ? CITY[hit] : { alerts: genericAlerts(city), tips: genericTips(city) };

  const alerts = [...pack.alerts];
  const tips = [...pack.tips];
  const extraA = genericAlerts(city);
  const extraT = genericTips(city);

  let i = 0;
  while (alerts.length < 12) {
    const row = extraA[i % extraA.length];
    alerts.push({ ...row, name: `${row.name} (${alerts.length + 1})` });
    i += 1;
  }
  i = 0;
  while (tips.length < 10) {
    const row = extraT[i % extraT.length];
    tips.push({ ...row, name: `${row.name} (${tips.length + 1})` });
    i += 1;
  }

  return { alerts: alerts.slice(0, 12), tips: tips.slice(0, 10) };
}

export function fillIntel(city, alerts = [], tips = []) {
  const seeded = seedIntel(city);
  const seenA = new Set();
  const seenT = new Set();
  const outA = [];
  const outT = [];

  for (const a of [...alerts, ...seeded.alerts]) {
    if (!a?.name || seenA.has(a.name)) continue;
    seenA.add(a.name);
    outA.push({
      name: String(a.name),
      severity: ["high", "medium", "tip"].includes(a.severity) ? a.severity : "medium",
      description: String(a.description || ""),
      avoid: String(a.avoid || ""),
    });
  }

  for (const t of [...tips, ...seeded.tips]) {
    const name = t.name || t.title;
    if (!name || seenT.has(name)) continue;
    seenT.add(name);
    outT.push({
      name: String(name),
      description: String(t.description || t.desc || ""),
      avoid: String(t.avoid || t.saving || ""),
    });
  }

  return {
    alerts: outA.slice(0, 12),
    tips: outT.slice(0, 10),
  };
}