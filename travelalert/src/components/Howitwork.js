export default function Howitwork() {
  return (
    //  <!-- ── HOW IT WORKS ── -->
    <section className="steps-section" id="how">
      <div className="container">
        <div className="sec-header-center reveal">
          <div className="sec-label">How It Works</div>
          <h2 className="sec-title">
            Real data. <span className="grad">Not outdated guides.</span>
          </h2>
          <p className="sec-sub">
            TravelRadar pulls fresh reports from real travelers every day — then
            AI organizes it so you can act on it in seconds.
          </p>
        </div>
        <div className="steps-grid reveal">
          <div className="step-card">
            <div className="step-num-wrap">
              <div className="step-num">01</div>
            </div>
            <div className="step-title">Search your destination</div>
            <p className="step-desc">
              Type any city or country. We find it instantly from our database
              of 180+ destinations.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num-wrap">
              <div className="step-num">02</div>
            </div>
            <div className="step-title">We pull live Reddit data</div>
            <p className="step-desc">
              Our system fetches the latest real traveler experiences Get
              insights from thousands of recent traveler conversations, trip
              reports, and firsthand experiences across the web.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num-wrap">
              <div className="step-num">03</div>
            </div>
            <div className="step-title">AI organizes everything</div>
            <p className="step-desc">
              Our AI reads hundreds of posts, extracts scam alerts, tips, and
              warnings — structured and severity rated.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num-wrap">
              <div className="step-num">04</div>
            </div>
            <div className="step-title">You travel with confidence</div>
            <p className="step-desc">
              A clean, actionable briefing before you land. Know exactly what to
              watch for and how to avoid it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
