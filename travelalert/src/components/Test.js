export default function Test() {
  return (
    <section id="testimonials">
      <div className="container">
        <div className="sec-head reveal">
          <h2>They checked. <span className="grad-accent">They saved.</span></h2>
        </div>
        <div className="test-grid">
          <div className="t-card feat reveal" style={{ '--i': 0 }}>
            <div className="t-stars">★★★★★</div>
            <p className="t-q">&ldquo;Checked TravelRadar before Bangkok, avoided the gem shop scam on day one. My friend who didn&apos;t use it <b>lost $300 to the exact scam</b> I&apos;d been warned about.&rdquo;</p>
            <div className="t-auth"><div className="t-av">SK</div><div><div className="t-name">Sarah K.</div><div className="t-trip">Solo trip &middot; Bangkok</div></div></div>
          </div>
          <div className="test-col">
            <div className="t-card reveal" style={{ '--i': 1 }}>
              <div className="t-stars">★★★★★</div>
              <p className="t-q">&ldquo;First thing I open when I book a new destination. The Prague ATM alert alone saved my card.&rdquo;</p>
              <div className="t-auth"><div className="t-av">MR</div><div><div className="t-name">Marcus R.</div><div className="t-trip">Digital nomad, Pro subscriber</div></div></div>
            </div>
            <div className="t-card reveal" style={{ '--i': 2 }}>
              <div className="t-stars">★★★★★</div>
              <p className="t-q">&ldquo;Real current information, not a blog post from 2019. When it says a scam was reported 4x this week, I believe it.&rdquo;</p>
              <div className="t-auth"><div className="t-av">PL</div><div><div className="t-name">Priya L.</div><div className="t-trip">Backpacker, SE Asia</div></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
