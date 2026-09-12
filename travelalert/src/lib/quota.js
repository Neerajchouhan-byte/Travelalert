// src/lib/quota.js
//
// Single source of truth for the Explorer (free) search cap and the
// month-boundary logic used by both /api/briefing and /api/city-brief.
//
// Kept intentionally tiny — the goal is that any route which needs to know
// "is this user over their free-search quota?" imports from here, so the
// constant and the month-key format can never drift between routes.

export const FREE_SEARCH_LIMIT = 3;

/**
 * Month key in UTC, format "YYYY-MM". Matches what /api/briefing writes into
 * profiles.search_month and what the quota reset compares against.
 *
 * @param {Date} [date]
 * @returns {string}
 */
export function monthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Number of free searches consumed in the current month. Returns 0 when the
 * stored month does not match the current month (quota resets on month roll).
 *
 * @param {{ search_count?: number|string, search_month?: string }} profile
 * @returns {number}
 */
export function computeUsedSearches(profile) {
  if (!profile) return 0;
  const month = monthKey();
  if (profile.search_month !== month) return 0;
  return Number(profile.search_count) || 0;
}