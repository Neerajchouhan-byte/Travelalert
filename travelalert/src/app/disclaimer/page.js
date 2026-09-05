import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="container" style={{ maxWidth: 720, padding: "96px 20px 64px" }}>
      <Link href="/" style={{ color: "#a6a6ad", fontSize: 14 }}>
        ← Home
      </Link>
      <h1>Disclaimer</h1>
      <p>
        TravelRadar summaries come from public traveler posts and an AI model.
        They are not a guarantee you will avoid crime, scams, or loss.
      </p>
      <p>
        Always use official transport apps, bank ATMs, and your own judgment.
        We are not liable for money lost, missed trips, or injury.
      </p>
    </main>
  );
}