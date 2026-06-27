export default function Features() {
  return (
    //  <!-- ── FEATURES ── -->
    <section className="sec-wrap" id="features">
      <div className="container">
        <div className="sec-header-center reveal">
          <div className="sec-label">What We Cover</div>
          <h2 className="sec-title grad">Everything a smart traveler needs</h2>
          <p className="sec-sub">
            From scam warnings to hidden gems — we cover every aspect of your
            journey so you travel with total confidence.
          </p>
        </div>
        <div className="features-grid">
          <div className="feat-card feat-stagger">
            <div className="feat-icon red">🚨</div>
            <div className="feat-title">Live Scam Alerts</div>
            <p className="feat-desc">
              Real-time warnings about active scams — taxi overcharging, fake
              tours, rigged ATMs, counterfeit tickets, and more. Updated daily
              from Reddit.
            </p>
            <div className="feat-shine"></div>
          </div>
          <div className="feat-card feat-stagger">
            <div className="feat-icon purple">🏨</div>
            <div className="feat-title">Accommodation Intel</div>
            <p className="feat-desc">
              Know which areas to stay, hidden fees to watch for, and how to
              spot fake listings before you book. Save money, sleep safely.
            </p>
            <div className="feat-shine"></div>
          </div>
          <div className="feat-card feat-stagger">
            <div className="feat-icon green">🍜</div>
            <div className="feat-title">Food & Dining Tips</div>
            <p className="feat-desc">
              Best local eats, tourist-trap restaurants to skip, food safety
              advice, and how to order without getting overcharged by 300%.
            </p>
            <div className="feat-shine"></div>
          </div>
          <div className="feat-card feat-stagger">
            <div className="feat-icon amber">🚕</div>
            <div className="feat-title">Transport Guidance</div>
            <p className="feat-desc">
              Navigate airports, taxis, metros, and buses like a local. Know
              fair prices, legit apps, and which transport scams to watch for.
            </p>
            <div className="feat-shine"></div>
          </div>
          <div className="feat-card feat-stagger">
            <div className="feat-icon blue">💱</div>
            <div className="feat-title">Money & Currency</div>
            <p className="feat-desc">
              Where to exchange, which ATMs to trust, dynamic currency
              conversion tricks, and how to avoid losing 20% on every
              transaction.
            </p>
            <div className="feat-shine"></div>
          </div>
          <div className="feat-card feat-stagger">
            <div className="feat-icon teal">🌍</div>
            <div className="feat-title">Destination Deep Dives</div>
            <p className="feat-desc">
              Comprehensive guides for 180+ cities — culture, safety zones,
              seasonal tips, and local tricks only experienced regulars know.
            </p>
            <div className="feat-shine"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
