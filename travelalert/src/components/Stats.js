export default function Stats() {
  return (
    <div className="stats">
      <div className="container stats-row">
        <div className="stats-intro"><span className="eyebrow">The signal at a glance</span><p>Travel intelligence that helps you make one better decision before every trip.</p></div>
        <div className="stat reveal" style={{ '--i': 0 }}><b className="grad-accent">$9.2M</b><span>Lost to tourist scams annually in SEA</span></div>
        <div className="stat reveal" style={{ '--i': 1 }}><b>2,400+</b><span>Scam patterns tracked live</span></div>
        <div className="stat reveal" style={{ '--i': 2 }}><b>180+</b><span>Destinations covered</span></div>
        <div className="stat reveal" style={{ '--i': 3 }}><b>98%</b><span>Say TravelRadar was worth it</span></div>
      </div>
    </div>
  );
}
