import Searchbar from "./Searchbar";
export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-glow"></div>
      <div className="hero-pill">
        <span className="live-dot"></span>
        Live data from 50,000+ travelers worldwide
      </div>
      {/* <!-- PSYCHOLOGY: Loss aversion headline --> */}
      <h1 className="hero-h1">
        <span className="line-plain">Travel Smarter.</span>
        <span className="line-grad">Never Get Scammed.</span>
      </h1>

      {/* <!-- PSYCHOLOGY: Specificity — exact dollar amount --> */}
      <p className="hero-sub">
        The average tourist loses <strong>$180 to preventable scams</strong> on
        day one. TravelRadar gives you real-time alerts from live Reddit data
        and AI — so you know what's happening before you land.
      </p>
      <Searchbar />
      

      <div className="hero-cta-row">
        {/* <!-- PSYCHOLOGY: Identity CTA --> */}
        <a href="#pricing" className="btn btn-accent btn-lg">
          Start Free — Smart Travelers Do This
        </a>
        <a href="#how" className="btn-link">
          See how it works
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* <!-- PSYCHOLOGY: Specific proof numbers --> */}
      <div className="hero-proof">
        <div className="proof-item">
          <div className="proof-num danger-num">$180</div>
          <div className="proof-lbl">Avg scam loss — SEA</div>
        </div>
        <div className="proof-item">
          <div className="proof-num">2,400+</div>
          <div className="proof-lbl">Scam patterns tracked</div>
        </div>
        <div className="proof-item">
          <div className="proof-num">180+</div>
          <div className="proof-lbl">Destinations covered</div>
        </div>
        <div className="proof-item">
          <div className="proof-num">50K+</div>
          <div className="proof-lbl">reports analyzed</div>
        </div>
        <div className="proof-item">
          <div className="proof-num">98%</div>
          <div className="proof-lbl">Say it was worth it</div>
        </div>
      </div>
    </section>
  );
}
