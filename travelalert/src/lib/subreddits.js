// src/lib/subreddits.js
//
// Maps a normalized city name to the most relevant subreddit used in the
// Serper query built by fetchLivePosts(). The value is substituted into
// the OR clause alongside the generic travel subs (r/travel, r/solotravel,
// r/backpacking, r/shoestring, r/scams).
//
// A wrong or missing value only narrows that one OR branch — the query
// still runs against the generic travel subs, so a fallback of "travel"
// is safe and never produces an empty result set on its own.

const CITY_SUBREDDIT = {
  // Southeast Asia
  bangkok: "Thailand",
  phuket: "Thailand",
  "chiang mai": "Thailand",
  bali: "bali",
  hanoi: "Vietnam",
  "ho chi minh city": "Vietnam",
  "siem reap": "cambodia",
  "kuala lumpur": "malaysia",
  singapore: "singapore",

  // East Asia
  tokyo: "JapanTravel",
  kyoto: "JapanTravel",
  osaka: "JapanTravel",
  seoul: "korea",
  taipei: "taiwan",
  "hong kong": "HongKong",
  macau: "Macau",
  shanghai: "shanghai",
  beijing: "beijing",

  // South Asia
  delhi: "india",
  mumbai: "mumbai",
  jaipur: "india",
  agra: "india",
  kathmandu: "Nepal",
  colombo: "srilanka",

  // Europe — West
  london: "london",
  paris: "ParisTravelGuide",
  amsterdam: "Amsterdam",
  barcelona: "Barcelona",
  madrid: "Madrid",
  lisbon: "portugal",
  dublin: "Dublin",

  // Europe — Central / East
  prague: "Prague",
  vienna: "wien",
  berlin: "berlin",
  munich: "Munich",
  zurich: "Switzerland",
  brussels: "belgium",
  copenhagen: "copenhagen",
  stockholm: "stockholm",
  oslo: "Norway",
  helsinki: "Finland",
  reykjavik: "Iceland",

  // Europe — South
  rome: "ItalyTravel",
  milan: "ItalyTravel",
  venice: "ItalyTravel",
  florence: "ItalyTravel",
  athens: "greece",
  santorini: "greece",
  istanbul: "istanbul",
  antalya: "Turkey",

  // Middle East / Africa
  dubai: "dubai",
  mecca: "islam",
  cairo: "Egypt",
  marrakech: "Morocco",
  "cape town": "capetown",

  // Americas
  "new york": "AskNYC",
  miami: "Miami",
  "las vegas": "vegas",
  "mexico city": "MexicoCity",
  cancun: "cancun",
  "rio de janeiro": "riodejaneiro",
  "buenos aires": "BuenosAires",

  // Oceania
  sydney: "sydney",
  melbourne: "melbourne",
};

/**
 * Returns the best-matching subreddit name for a city, used to build the
 * Serper site: query. Falls back to "travel" for unknown cities — the query
 * still matches the generic travel subs in the OR clause.
 *
 * @param {string} city — a raw or normalized city name ("Bangkok", "bangkok").
 * @returns {string} a subreddit name without the "r/" prefix.
 */
export function getSubredditForCity(city) {
  const key = String(city || "").trim().toLowerCase();
  if (!key) return "travel";
  return CITY_SUBREDDIT[key] || "travel";
}