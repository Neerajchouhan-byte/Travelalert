export default function Navbar() {
  return (
    <div className="nav-wrap">
      <nav>
        <div className="nav-logo"><a href="#hero">TravelRadar</a></div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
        <div className="nav-right">
          <a href="#" className="nav-login">Log in</a>
          <a href="#pricing" className="btn btn-accent">Get Started Free</a>
        </div>
      </nav>
    </div>
  );
}