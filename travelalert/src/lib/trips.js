import { normalizeCity, resolveCity, cityKey } from "./city.js";
import { adminDb } from "./supabase-admin.js";

export const TRIP_MIN_DESTINATIONS = 3;
export const TRIP_MAX_DESTINATIONS = 6;
export const TRIP_NAME_MAX_LENGTH = 80;

// Normalize + dedupe a raw destinations input into trip rows.
// Reuses resolveCity/normalizeCity/cityKey — no new city logic.
// Accepts strings ("Paris") or objects ({ city, visit_date }).
// Returns { destinations } or { error }.
//
// Enforces the 3-6 destination rule. This is the validator for a COMPLETE
// trip (the create-trip form, the save-changes form). It is NOT used by
// quick-add on a first-add, because that path legitimately starts with 1
// destination — use normalizeSingleDestination for that case.
export function normalizeTripDestinations(input) {
  const list = Array.isArray(input) ? input : [];
  const seen = new Set();
  const destinations = [];

  for (const entry of list) {
    const rawCity = typeof entry === "string" ? entry : entry?.city;
    const rawDate =
      typeof entry === "string" ? null : entry?.visit_date || entry?.visitDate || null;
    const city = resolveCity(rawCity) || normalizeCity(rawCity);
    const key = city ? cityKey(city) : "";
    if (!city || !key || seen.has(key)) continue;
    seen.add(key);

    let visit_date = null;
    if (rawDate) {
      const parsed = new Date(String(rawDate));
      if (!Number.isNaN(parsed.getTime())) {
        visit_date = parsed.toISOString().slice(0, 10);
      }
    }

    destinations.push({ city, destination_key: key, visit_date });
  }

  if (destinations.length < TRIP_MIN_DESTINATIONS) {
    return {
      error: `Add at least ${TRIP_MIN_DESTINATIONS} destinations (up to ${TRIP_MAX_DESTINATIONS}).`,
    };
  }
  if (destinations.length > TRIP_MAX_DESTINATIONS) {
    return { error: `Trips support up to ${TRIP_MAX_DESTINATIONS} destinations.` };
  }
  return { destinations };
}

/**
 * Single-destination normalizer. Same city resolution as
 * normalizeTripDestinations, but no minimum-count check. Used by the
 * quick-add "first city" path — a trip can start with 1 destination and
 * grow to 3-6 later.
 *
 * Returns { city, destination_key, visit_date } or null when the input is
 * unrecognizable.
 */
export function normalizeSingleDestination(rawCity, visitDate) {
  const city = resolveCity(rawCity) || normalizeCity(rawCity);
  const key = city ? cityKey(city) : "";
  if (!city || !key) return null;

  let normalizedDate = null;
  if (visitDate) {
    const parsed = new Date(String(visitDate));
    if (!Number.isNaN(parsed.getTime())) {
      normalizedDate = parsed.toISOString().slice(0, 10);
    }
  }

  return { city, destination_key: key, visit_date: normalizedDate };
}

export function normalizeTripName(raw) {
  const name = String(raw || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, TRIP_NAME_MAX_LENGTH);
  return name || "My Trip";
}

/**
 * Bulk-inserts ordered destinations for a trip. Used by the first-add path
 * after the trip row has been created, and by the create-trip route.
 */
export async function insertTripDestinations(admin, tripId, destinations) {
  const rows = destinations.map((d, i) => ({
    trip_id: tripId,
    city: d.city,
    destination_key: d.destination_key,
    order_index: i,
    visit_date: d.visit_date,
  }));

  const { error } = await admin.from("trip_destinations").insert(rows);
  if (error) return { ok: false, error };
  return { ok: true };
}

/**
 * Appends a single destination to an existing trip. Enforces:
 *   - valid city name (rejects with INVALID_CITY)
 *   - not already present (rejects with DUPLICATE_DESTINATION)
 *   - below TRIP_MAX_DESTINATIONS (rejects with TRIP_FULL)
 * Returns { ok: true, destination } or { ok: false, error, code, status }.
 */
export async function appendTripDestination(userId, tripId, rawCity, visitDate) {
  const admin = adminDb();

  const { data: existing, error: loadErr } = await admin
    .from("trip_destinations")
    .select("destination_key")
    .eq("trip_id", tripId);
  if (loadErr) {
    return { ok: false, error: loadErr.message, code: "LOAD_FAILED", status: 500 };
  }

  const destination = normalizeSingleDestination(rawCity, visitDate);
  if (!destination) {
    return { ok: false, error: "Invalid city name.", code: "INVALID_CITY", status: 400 };
  }

  const existingKeys = new Set((existing || []).map((d) => d.destination_key));
  if (existingKeys.has(destination.destination_key)) {
    return {
      ok: false,
      error: `${destination.city} is already in this trip.`,
      code: "DUPLICATE_DESTINATION",
      status: 400,
    };
  }

  if ((existing || []).length >= TRIP_MAX_DESTINATIONS) {
    return {
      ok: false,
      error: `Trips support up to ${TRIP_MAX_DESTINATIONS} destinations.`,
      code: "TRIP_FULL",
      status: 400,
    };
  }

  const orderIndex = (existing || []).length;
  const { error: insErr } = await admin.from("trip_destinations").insert({
    trip_id: tripId,
    city: destination.city,
    destination_key: destination.destination_key,
    order_index: orderIndex,
    visit_date: destination.visit_date,
  });
  if (insErr) {
    return { ok: false, error: insErr.message, code: "INSERT_FAILED", status: 500 };
  }

  return {
    ok: true,
    destination: { ...destination, order_index: orderIndex },
  };
}

/**
 * Maps a Supabase / generic error into a user-facing response shape.
 * Callers use the returned { message, code, status } directly.
 */
export function describeTripSaveError(error) {
  const msg = String(error?.message || error || "").toLowerCase();
  if (msg.includes("duplicate") || msg.includes("unique")) {
    return {
      message: "This destination is already in the trip.",
      code: "DUPLICATE_DESTINATION",
      status: 400,
    };
  }
  if (msg.includes("permission") || msg.includes("row-level")) {
    return {
      message: "Trip save was denied by the database.",
      code: "PERMISSION_DENIED",
      status: 403,
    };
  }
  return {
    message: "Could not save the trip. Please try again.",
    code: "SAVE_FAILED",
    status: 500,
  };
}

/** Consistent error logger for trip routes. */
export function logTripError(context, error) {
  console.error(`[Trips] ${context}:`, error?.message || error);
}