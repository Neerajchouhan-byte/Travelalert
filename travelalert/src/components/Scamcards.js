import ScamCard from "@/components/ScamCard";

const scams = [
  {
    destination: "Bangkok, Thailand",
    badge: "High risk",
    sevClass: "high",
    loss: "$200",
    name: "Tuk-Tuk Free Temple Tour",
    description: "A friendly local near the Grand Palace offers a free tuk-tuk tour, then drives you to gem shops with heavy pressure to buy.",
    avoidanceTip: "Refuse all 'free tour' offers. Use the Grab app only.",
    sourceInfo: "REPORTED 4X THIS WEEK &middot; 847 UPVOTES",
    image: "https://picsum.photos/seed/bangkok-tuktuk/500/300",
    wide: true,
  },
  {
    destination: "Bali, Indonesia",
    badge: "High risk",
    sevClass: "high",
    loss: "$150",
    name: "Motorbike Damage Claim",
    description: "Rental returned, owner claims new damage and demands cash, refusing insurance.",
    avoidanceTip: "Photo every scratch before riding.",
    sourceInfo: "REPORTED 6X THIS WEEK",
    image: "https://picsum.photos/seed/bali-scooter/500/300",
  },
  {
    destination: "Prague, Czechia",
    badge: "Medium",
    sevClass: "medium",
    loss: "$400",
    name: "ATM Skimming Device",
    description: "Skimmers found on standalone ATMs near Old Town Square. Cards cloned within hours.",
    avoidanceTip: "Use bank-branch ATMs. Cover the keypad.",
    sourceInfo: "CONFIRMED THIS WEEK",
    image: "https://picsum.photos/seed/prague-atm/500/300",
  },
  {
    destination: "Hanoi, Vietnam",
    badge: "Medium",
    sevClass: "medium",
    loss: "$25",
    name: "Taxi No-Meter Scam",
    description: "Driver claims a broken meter, then charges 3 to 5x fare, common late night at Noi Bai.",
    avoidanceTip: "Use Grab. Agree the price first.",
    sourceInfo: "REPORTED 9X THIS WEEK",
    image: "https://picsum.photos/seed/hanoi-taxi/500/300",
  },
  {
    destination: "Bangkok, Thailand",
    badge: "Tip",
    sevClass: "tip",
    loss: "$45",
    name: "Best Transport From the Airport",
    description: "Download Grab before landing. Fixed price around 280 THB, versus street taxis charging 800 to 1200 THB.",
    avoidanceTip: "Book Grab before leaving the arrivals hall.",
    sourceInfo: "3.4K UPVOTES &middot; VERIFIED TIP",
    image: "https://picsum.photos/seed/bangkok-airport/500/300",
    wide: true,
  },
];

export default function Scamcards() {
  return (
    <section id="scams" style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <div className="sec-head reveal">
          <h2>Active right now. <span className="grad-accent">Updated daily.</span></h2>
          <p className="sec-sub">Every alert below is sourced from real traveler reports this week, not a 2019 blog post.</p>
        </div>
        <div className="scam-grid">
          {scams.map((scam, index) => (
            <ScamCard key={index} {...scam} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
