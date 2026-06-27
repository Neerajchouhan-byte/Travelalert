export default function Cta() {
  return (
    // <!-- ── FINAL CTA ── -->
    <section className="cta-section">
      <div className="cta-glow"></div>
      <div className="cta-inner reveal">
        {/* <!-- PSYCHOLOGY: Fear trigger --> */}
        <div className="cta-chip">
          <span className="live-dot"></span>
          12 scams reported in the last 24 hours
        </div>
        <h2 className="cta-h2">
          Don't be the tourist
          <br />
          <span className="grad">who finds out after.</span>
        </h2>
        <p className="cta-sub">
          Travelers have already checked their destination before landing. Takes
          30 seconds. Could save you $180 on day one.
        </p>
        <div className="cta-actions">
          <a href="#" className="btn btn-accent btn-lg">
            Check My Destination — It's Free
          </a>
          <div className="cta-note">
            <span className="live-dot"></span>
            Smart travelers check before they fly. Always.
          </div>
        </div>
      </div>
    </section>
  );
}
