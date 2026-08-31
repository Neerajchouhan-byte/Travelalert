export default function Features() {
  return (
    <section id="features">
      <div className="container">
        <div className="sec-head reveal">
          <span className="eyebrow">What we cover</span>
          <h2>Everything a smart traveler needs</h2>
          <p className="sec-sub">From scam warnings to hidden gems, covering every part of the trip so you travel with confidence.</p>
        </div>
        <div className="bento">
          <div className="b-card lg reveal" style={{ '--i': 0 }}>
            <div className="b-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
            <div className="b-title">Live scam alerts</div>
            <p className="b-desc">Real-time warnings on taxi overcharging, fake tours, rigged ATMs, and counterfeit tickets. Pulled fresh from Reddit every day.</p>
          </div>
          <div className="b-card reveal" style={{ '--i': 1 }}>
            <div className="b-icon"><i className="fa-solid fa-bed"></i></div>
            <div className="b-title">Accommodation intel</div>
            <p className="b-desc">Which areas to stay, hidden fees to watch, and how to spot fake listings before you book.</p>
          </div>
          <div className="b-card reveal" style={{ '--i': 2 }}>
            <div className="b-icon"><i className="fa-solid fa-bowl-food"></i></div>
            <div className="b-title">Food &amp; dining tips</div>
            <p className="b-desc">Best local eats, tourist-trap restaurants to skip, and how to order without a 300% markup.</p>
          </div>
          <div className="b-card reveal" style={{ '--i': 3 }}>
            <div className="b-icon"><i className="fa-solid fa-taxi"></i></div>
            <div className="b-title">Transport guidance</div>
            <p className="b-desc">Fair prices, legit apps, and which transport scams to watch for, city by city.</p>
          </div>
          <div className="b-card reveal" style={{ '--i': 4 }}>
            <div className="b-icon"><i className="fa-solid fa-money-bill-transfer"></i></div>
            <div className="b-title">Money &amp; currency</div>
            <p className="b-desc">Where to exchange, which ATMs to trust, and how to avoid losing 20% on every transaction.</p>
          </div>
          <div className="b-card reveal" style={{ '--i': 5 }}>
            <div className="b-icon"><i className="fa-solid fa-earth-asia"></i></div>
            <div className="b-title">Destination deep dives</div>
            <p className="b-desc">Guides for 180+ cities: safety zones, seasonal tips, and local tricks only regulars know.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
