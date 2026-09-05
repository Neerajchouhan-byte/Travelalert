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
            <div className="b-icon"><i className="fa-solid fa-cloud-sun"></i></div>
            <div className="b-title">Weather on the ground</div>
            <p className="b-desc">Current temperature, UV, and a short note on what to wear the day you land.</p>
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
            <div className="b-icon"><i className="fa-solid fa-coins"></i></div>
            <div className="b-title">Live currency check</div>
            <p className="b-desc">Local rate vs USD plus ATM and DCC advice so you do not lose a silent cut at the airport desk.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
