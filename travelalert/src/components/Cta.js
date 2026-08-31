export default function Cta() {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-panel reveal">
          <span className="eyebrow"><span className="live-dot"></span>12 SCAMS REPORTED IN THE LAST 24 HOURS</span>
          <h2 className="cta-h2">Don't be the tourist <span className="grad-accent">who finds out after.</span></h2>
          <p className="cta-sub">Takes 30 seconds. Could save you $180 on day one.</p>
          <a href="#hero" className="btn-primary" style={{ padding: '0.85rem 0.5rem 0.85rem 1.8rem', fontSize: '1rem' }}><span>Check my destination</span><span className="icw" style={{ width: '2.4rem', height: '2.4rem' }}><i className="fa-solid fa-arrow-right"></i></span></a>
          <div className="cta-note"><span className="live-dot"></span>Smart travelers check before they fly.</div>
        </div>
      </div>
    </section>
  );
}
