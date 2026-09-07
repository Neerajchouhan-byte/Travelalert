import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="container" style={{ maxWidth: 720, padding: "96px 20px 64px" }}>
      <Link href="/" style={{ color: "#a6a6ad", fontSize: 14 }}>
        ← Home
      </Link>
      <h1>Terms of Use</h1>
      <p>Last updated: September 5, 2026</p>
      <p>
        By using TravelRadar you agree to these terms. If you do not agree,
        do not use the product.
      </p>
      <h2>What this product is</h2>
      <p>
        TravelRadar organizes traveler reports and model-generated briefings
        about common tourist risks. It is a research aid, not legal, safety,
        or insurance advice.
      </p>
      <h2>Accounts</h2>
      <p>
        You must provide a real email. Free accounts see a limited briefing.
        Per-trip Passes provide full access for 30 days, Annual plans provide full
        access while active, and Destination Packs provide permanent access only
        to the destination purchased.
      </p>
      <h2>Payments</h2>
      <p>
        Dodo Payments processes checkout. The Annual plan is billed once each year
        and can be cancelled before its next renewal. Per-trip Passes and
        Destination Packs are one-time purchases and do not renew.
      </p>
      <h2>Accuracy</h2>
      <p>
        Alerts can be incomplete, outdated, or wrong. You are responsible for
        your own decisions while traveling.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Do not scrape, resell, or abuse the API. We may suspend accounts that
        do.
      </p>
    </main>
  );
}