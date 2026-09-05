const items = [
  ['Tuk-Tuk Scam', 'Bangkok', '$200'],
  ['Fake Parking', 'Bali', '$15'],
  ['Gem Store Scam', 'Bangkok', '$300'],
  ['Motorbike Damage', 'Bali', '$150'],
  ['ATM Skimming', 'Prague', '$400'],
  ['Bracelet Scam', 'Rome', '$20'],
  ['Taxi No Meter', 'Hanoi', '$25'],
  ['Fake Monk', 'Bangkok', '$50'],
];

const trackItems = [...items, ...items];

export default function Marquee() {
  return (
    <div className="marquee-shell">
      <div className="container marquee-label">
        <span className="live-dot"></span>
        <span>Live scam reports</span>
        <span className="marquee-update">Updated hourly</span>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          {trackItems.map(([name, city, amount], index) => (
            <span key={`${name}-${city}-${index}`} className="m-item">
              <b>{name}</b> &middot; {city} &middot; avg loss <span className="amt">{amount}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
