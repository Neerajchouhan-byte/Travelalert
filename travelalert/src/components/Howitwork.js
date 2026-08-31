export default function Howitwork() {
  return (
    <section id="how">
      <div className="container">
        <div className="sec-head reveal">
          <h2>Real data. <span className="grad-accent">Not outdated guides.</span></h2>
          <p className="sec-sub">TravelRadar pulls fresh reports from real travelers every day, then AI organizes it so you can act on it in seconds.</p>
        </div>
        <div className="timeline">
          <div className="t-step reveal" style={{ '--i': 0 }}><div className="t-num">01</div><h3>Search your destination</h3><p>Type any city or country from our database of 180+ destinations.</p></div>
          <div className="t-step reveal" style={{ '--i': 1 }}><div className="t-num">02</div><h3>We pull live Reddit data</h3><p>Fresh traveler reports, trip write-ups, and firsthand warnings, fetched daily.</p></div>
          <div className="t-step reveal" style={{ '--i': 2 }}><div className="t-num">03</div><h3>AI organizes everything</h3><p>Hundreds of posts distilled into structured, severity-rated alerts.</p></div>
          <div className="t-step reveal" style={{ '--i': 3 }}><div className="t-num">04</div><h3>You travel with confidence</h3><p>A clean briefing before you land. Know exactly what to watch for.</p></div>
        </div>
      </div>
    </section>
  );
}
