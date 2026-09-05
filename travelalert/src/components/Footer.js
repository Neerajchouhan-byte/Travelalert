import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="f-top">
          <div>
            <div className="f-logo">TravelRadar</div>
            <p className="f-tag">Know before you go.</p>
          </div>
          <div className="f-nav">
            <div className="f-col">
              <span className="f-col-title">Product</span>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <Link href="/login">Get started</Link>
            </div>
            <div className="f-col">
              <span className="f-col-title">Company</span>
              <a href="#how">How it works</a>
              <Link href="/disclaimer">Disclaimer</Link>
            </div>
            <div className="f-col">
              <span className="f-col-title">Legal</span>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </div>
        <div className="f-bottom">
          <span>© 2026 TravelRadar</span>
          <span>Travel smarter.</span>
        </div>
      </div>
    </footer>
  );
}