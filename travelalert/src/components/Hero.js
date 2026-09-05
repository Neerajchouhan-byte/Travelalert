import Searchbar from "./Searchbar";

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container hero-grid">
        <div className="hero-left reveal in">
          <span className="eyebrow">
            <span className="live-dot"></span>
            LIVE DESTINATION BRIEFS
          </span>
          <h1>
            <span>Know before you go.</span>
            <span className="grad-accent">Not after you&apos;re scammed.</span>
          </h1>
          <p className="hero-sub">
            The average tourist loses $180 to scams on day one. Real traveler
            reports, organized by AI, before you land.
          </p>
          <Searchbar />
        </div>

        <div
          className="hero-right reveal in"
          style={{ transitionDelay: "150ms" }}
        >
          <div className="radar-wrap">
            <div className="radar-ring"></div>
            <div className="radar-ring r2"></div>
            <div className="radar-ring r3"></div>
            <div className="radar-ring r4"></div>
            <div
              className="radar-crosshair"
              style={{ position: "absolute", inset: 0 }}
            ></div>
            <div className="radar-sweep"></div>
            <div className="radar-core"></div>
            <div className="blip b1">
              <span className="dot"></span>
              <span className="lbl">Bangkok</span>
            </div>
            <div className="blip b2">
              <span className="dot"></span>
              <span className="lbl">Bali</span>
            </div>
            <div className="blip b3">
              <span className="dot"></span>
              <span className="lbl">Rome</span>
            </div>
            <div className="blip b4">
              <span className="dot"></span>
              <span className="lbl">Prague</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
