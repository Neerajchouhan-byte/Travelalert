// src/lib/scam-data.js
//
// SEO destination pages read from the same `destinations` cache table used by
// the dashboard. This module adapts the cached alert shape
// ({ name, severity, description, avoid }) to the shape the /scams pages
// render ({ title, category, severity, description, prevention, gated }).
//
// No hardcoded city list — every entry is derived from the cache.

import { getCachedCity, listCachedCities } from "./cache.js";
import { normalizeCity } from "./city.js";
import { findKnownCity } from "./dashboard-data.js";

const VISIBLE_ALERT_COUNT = 5;

function slugToCityName(slug) {
  if (!slug || typeof slug !== "string") return "";
  return normalizeCity(slug.replace(/-/g, " "));
}

function cityNameToSlug(name) {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, "-");
}

function normalizeSeverity(s) {
  const v = String(s || "").toLowerCase();
  return v === "high" ? "High Financial Risk" : "Common";
}

function inferCategory(alert) {
  const text = `${alert.name || alert.title || ""} ${alert.description || alert.desc || ""}`.toLowerCase();
  if (/\b(atm|skim|card|bank|money|currency|exchange)\b/.test(text)) return "MONEY / ATM";
  if (/\b(bar|night|club|drink|show)\b/.test(text)) return "NIGHTLIFE";
  if (/\b(temple|palace|monk|shrine)\b/.test(text)) return "TEMPLE / SIGHTSEEING";
  if (/\b(taxi|transport|meter|grab|tuk|boat|ferry|transit|ride)\b/.test(text)) return "TRANSIT";
  if (/\b(hotel|hostel|accommodation|booking)\b/.test(text)) return "ACCOMMODATION";
  if (/\b(shop|market|tailor|vendor|souvenir)\b/.test(text)) return "SHOPPING";
  if (/\b(police|official|inspector)\b/.test(text)) return "STREET TACTICS";
  if (/\b(restaurant|food|eat|meal)\b/.test(text)) return "FOOD & DINING";
  return "TRAVEL SAFETY";
}

function toPageAlert(rawAlert, index) {
  return {
    title: rawAlert.name || rawAlert.title || "Travel alert",
    category: inferCategory(rawAlert),
    severity: normalizeSeverity(rawAlert.severity),
    description: rawAlert.description || rawAlert.desc || "",
    prevention: rawAlert.avoid || rawAlert.prevention || "",
    gated: index >= VISIBLE_ALERT_COUNT,
  };
}

function buildIntro(cityName, rawAlerts) {
  const high = rawAlerts.filter((a) => String(a.severity || "").toLowerCase() === "high").length;
  const medium = rawAlerts.filter((a) => String(a.severity || "").toLowerCase() === "medium").length;
  const topNames = rawAlerts.slice(0, 2).map((a) => a.name).filter(Boolean);
  const topPart =
    topNames.length >= 2
      ? `The two most reported patterns are ${topNames[0]} and ${topNames[1]}.`
      : topNames.length === 1
        ? `The most reported pattern is ${topNames[0]}.`
        : "";
  return `Travelers have flagged ${rawAlerts.length} active scam patterns in ${cityName} for 2026 — ${high} high-risk and ${medium} common. ${topPart} The prevention advice below is drawn from the actual reports.`;
}

function buildFaqs(cityName, rawAlerts) {
  const topNames = rawAlerts.slice(0, 5).map((a) => a.name).filter(Boolean);
  const topAvoids = rawAlerts.slice(0, 3).map((a) => a.avoid).filter(Boolean);
  return [
    {
      question: `What are the most common tourist scams in ${cityName}?`,
      answer:
        topNames.length > 0
          ? `Traveler reports most frequently mention: ${topNames.join("; ")}.`
          : `Recent traveler reports flag several active scam patterns in ${cityName}.`,
    },
    {
      question: `How can I avoid scams in ${cityName}?`,
      answer:
        topAvoids.length > 0
          ? `Common prevention advice: ${topAvoids.join(" ")}`
          : `Use official transport, verify prices before paying, and leave any situation involving threats or coercion.`,
    },
    {
      question: `Is ${cityName} safe for tourists?`,
      answer: `Millions of travelers visit ${cityName} safely each year. Use normal precautions — verified transport, known ATMs, no unsolicited tours. Leave any situation involving threats or coercion.`,
    },
  ];
}

/**
 * Returns the SEO-shaped destination object for a slug, or null if the city
 * has no cached data. The slug is expected in hyphenated URL form
 * (e.g. "new-york") and is converted back to the cache key form ("new york").
 */
export async function getScamCity(slug) {
  const cityName = slugToCityName(slug);
  if (!cityName) return null;

  const cached = await getCachedCity(cityName);
  if (!cached?.data) return null;

  const rawAlerts = cached.data.alerts || [];
  const alerts = rawAlerts.map(toPageAlert);

  return {
    slug,
    name: cityName,
    alerts,
    rawAlerts,
    tips: cached.data.tips || [],
    intro: buildIntro(cityName, rawAlerts),
    faqs: buildFaqs(cityName, rawAlerts),
    updatedAt: cached.updatedAt,
    source: cached.data.source || "cache",
  };
}

/**
 * Lists all cached cities for the sitemap and /scams index. Returns
 * { slug, name, updatedAt } objects.
 */
export async function listScamCities() {
  const rows = await listCachedCities();
  return rows
    .filter((row) => row.city)
    .map((row) => ({
      slug: cityNameToSlug(row.city),
      name: normalizeCity(row.city) || row.city,
      updatedAt: row.updated_at,
    }));
}

// Country extraction. Only the 12 curated cities in dashboard-data.js have a
// known country; every other cached city returns null. That's the correct
// behavior for this feature — same-country matching is preferred but never
// required, and the fallback fills from any other cached destination.
function countryOf(cityName) {
  const known = findKnownCity(cityName);
  if (!known) return null;
  const parts = String(known.name || "").split(", ");
  return parts.length > 1 ? parts.slice(1).join(", ") : null;
}

/**
 * Returns up to `limit` related cached destinations for the given slug.
 *
 * Ordering:
 *   1. Same country as the current city (only resolvable for curated cities).
 *   2. Any other cached destination, in insertion order.
 *
 * Never includes the current city. Never returns more than `limit`. Returns
 * [] when the destination table has no other cities.
 */
export async function getRelatedCities(currentSlug, limit = 5) {
  const all = await listScamCities();
  const current = all.find((c) => c.slug === currentSlug);
  if (!current) return [];

  const currentCountry = countryOf(current.name);
  const others = all.filter((c) => c.slug !== currentSlug);

  const sameCountry = [];
  const rest = [];
  for (const c of others) {
    const country = countryOf(c.name);
    if (currentCountry && country === currentCountry) sameCountry.push(c);
    else rest.push(c);
  }

  const seen = new Set();
  const result = [];
  for (const c of [...sameCountry, ...rest]) {
    if (seen.has(c.slug)) continue;
    seen.add(c.slug);
    result.push(c);
    if (result.length >= limit) break;
  }
  return result;
}