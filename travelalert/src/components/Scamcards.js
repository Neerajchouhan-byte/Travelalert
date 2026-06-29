import ScamCard from "@/components/ScamCard";

const scams = [
  {
    destination: "Bangkok, Thailand 🇹🇭",
    badge: "High Risk",
    sevClass: "high",
    badgeClass: "badge-h",
    lossClass: "danger",
    loss: "$200",
    lossLabel: "Average victim loss",
    name: "Tuk-Tuk Free Temple Tour",
    description:
      "A friendly local near Grand Palace offers a free tuk-tuk city tour. Drives you to gem/tailor shops with extreme pressure to buy overpriced items.",
    avoidanceTip: '✓ Refuse all "free tour" offers. Use Grab app only.',
    sourceInfo: "reported 4× this week · 847 upvotes",
  },
  {
    destination: "Bali, Indonesia 🇮🇩",
    badge: "High Risk",
    sevClass: "high",
    badgeClass: "badge-h",
    lossClass: "danger",
    loss: "$150",
    lossLabel: "Average victim loss",
    name: "Motorbike Damage Claim",
    description:
      "Rented motorbike returned with pre-existing scratches. Owner demands $100-200 cash claiming you caused damage. Refuses insurance.",
    avoidanceTip:
      "✓ Photo every scratch before riding. Use reputable shops only.",
    sourceInfo: "reported 6× this week · 1.2k upvotes",
  },
  {
    destination: "Prague, Czech Republic 🇨🇿",
    badge: "Medium",
    sevClass: "medium",
    badgeClass: "badge-m",
    lossClass: "danger",
    loss: "$400",
    lossLabel: "Average victim loss",
    name: "ATM Skimming Device",
    description:
      "Card skimmer devices found on ATMs near Old Town Square. Cards cloned and drained within hours. Standalone ATMs most targeted.",
    avoidanceTip:
      "✓ Use bank-branch ATMs only. Cover keypad when entering PIN.",
    sourceInfo: "confirmed this week · 2.3k upvotes",
  },
  {
    destination: "Hanoi, Vietnam 🇻🇳",
    badge: "Medium",
    sevClass: "medium",
    badgeClass: "badge-m",
    lossClass: "danger",
    loss: "$25",
    lossLabel: "Average victim loss",
    name: "Taxi No Meter Scam",
    description:
      'Taxi driver claims meter is broken or "fixed price" is better. Charges 3-5× fair price. Most common at Noi Bai Airport late at night.',
    avoidanceTip:
      "✓ Use Grab app. Agree price before entering. Walk away if pressured.",
    sourceInfo: "reported 9× this week",
  },
  {
    destination: "Rome, Italy 🇮🇹",
    badge: "Medium",
    sevClass: "medium",
    badgeClass: "badge-m",
    lossClass: "danger",
    loss: "$20",
    lossLabel: "Average victim loss",
    name: "Bracelet Gift Scam",
    description:
      "Man near Trevi Fountain ties a bracelet on your wrist calling it a gift, then demands aggressive payment. Grabs your hand if you try to leave.",
    avoidanceTip: "✓ Keep hands in pockets. Say 'No' firmly and keep walking.",
    sourceInfo: "reported 11× this week",
  },
  {
    destination: "Bangkok, Thailand 🇹🇭",
    badge: "Tip",
    sevClass: "tip",
    badgeClass: "badge-t",
    lossClass: "tip-col",
    loss: "$45",
    lossLabel: "Saved per airport trip using Grab",
    name: "Best Transport from Airport",
    description:
      "Download Grab before landing. Book immediately on arrival. Fixed price ~280 THB vs street taxis charging 800-1200 THB. Available 24/7.",
    avoidanceTip:
      "✓ Book Grab before leaving arrivals hall. 15 min wait average.",
    sourceInfo: "3.4k upvotes · verified tip",
  },
];
 
export default function Scamcards() {
  return (
    <section className="scam-section">
      <div className="container">
        <div className="sec-header-center reveal">
          <div className="sec-label">Live Scam Intelligence</div>
          <h2 className="sec-title">
            Active right now. <span className="grad-red">Updated daily.</span>
          </h2>
          <p className="sec-sub">
            Every alert below is sourced from real Travelers reports this week —
            not a 2019 blog post.
          </p>
        </div>
        <div className="scam-grid reveal">
          {scams.map((scam, index) => (
            <ScamCard key={index} {...scam} />
          ))}
        </div>
      </div>
    </section>
  );
}
