export default function Footer() {
  return (
    // <!-- ── FOOTER ── -->
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <span className="footer-logo">TravelRadar</span>
            <p className="footer-tag">
              Real-time scam alerts powered by live Reddit data and AI. Updated
              daily.
            </p>
          </div>
          <nav className="footer-nav">
            <div className="footer-col">
              <span className="footer-col-title">Product</span>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Destinations</a>
            </div>
            <div className="footer-col">
              <span className="footer-col-title">Company</span>
              <a href="#">About</a>
            </div>
            <div className="footer-col">
              <span className="footer-col-title">Legal</span>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">
            © 2026 TravelRadar. All rights reserved. Data sourced from Reddit
            communities.
          </p>
          <p className="footer-copy">
            Built to help smart travelers — not to replace common sense.
          </p>
        </div>
      </div>
    </footer>
  );
}
