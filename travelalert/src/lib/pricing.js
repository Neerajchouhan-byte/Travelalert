// src/lib/pricing.js
//
// Single source of truth for the display prices of the two paid tiers.
// Imported by:
//   - src/components/Pricing.js      (pricing section on the landing page)
//   - src/components/UpgradeModal.js (in-app upgrade modal)
//   - src/components/trips/TripLocked.js (Trip Mode locked upsell)
//
// Dodo's actual charge amounts live in DODO_*_PRODUCT_ID and are managed in
// the Dodo dashboard — these constants are for display only and must be kept
// in sync with the Dodo product configuration by hand.

export const PRICES = {
  trip_pass: {
    amount: "$7",
    period: "/ 30 days",
    label: "Trip Pass",
    note: "Pay once · 30 days · Unlimited cities",
  },
  annual: {
    amount: "$29",
    period: "/ year",
    label: "Annual",
    note: "Unlimited access all year",
  },
};

/** "Trip Pass ($7/30 days) or Annual ($29/year)" — the inline sentence used
 *  in the Trip Mode locked upsell. */
export function tripPassOrAnnualSentence() {
  return `Trip Pass (${PRICES.trip_pass.amount}/30 days) or Annual (${PRICES.annual.amount}/year)`;
}