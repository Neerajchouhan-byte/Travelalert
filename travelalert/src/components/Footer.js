export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="f-top">
          <div>
            <div className="f-logo">TravelRadar</div>
            <p className="f-tag">Real-time scam alerts powered by live Reddit data and AI. Updated daily.</p>
          </div>
          <div className="f-nav">
            <div className="f-col"><span className="f-col-title">Product</span><a href="#">Features</a><a href="#">Pricing</a><a href="#">Destinations</a></div>
            <div className="f-col"><span className="f-col-title">Company</span><a href="#">About</a></div>
            <div className="f-col"><span className="f-col-title">Legal</span><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div>
          </div>
        </div>
        <div className="f-bottom">
          <span>© 2026 TravelRadar. Data sourced from Reddit communities.</span>
          <span>Built to help smart travelers, not to replace common sense.</span>
        </div>
      </div>
    </footer>
  );
}
