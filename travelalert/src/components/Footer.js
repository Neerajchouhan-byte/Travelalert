export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="f-top">
          <div>
            <div className="f-logo">TravelRadar</div>
            <p className="f-tag">
              Real-time scam alerts powered by live traveler reports and AI.
              Updated daily.
            </p>
          </div>
          <div className="f-nav">
            <div className="f-col">
              <span className="f-col-title">Product</span>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="f-col">
              <span className="f-col-title">Company</span>
              <a href="/disclaimer">About</a>
            </div>
            <div className="f-col">
              <span className="f-col-title">Legal</span>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/disclaimer">Disclaimer</a>
            </div>
          </div>
        </div>
        <div className="f-bottom">
          <span>© 2026 TravelRadar. Data sourced from public traveler reports.</span>
          <span>Built to help smart travelers, not to replace common sense.</span>
        </div>
      </div>
    </footer>
  );
}