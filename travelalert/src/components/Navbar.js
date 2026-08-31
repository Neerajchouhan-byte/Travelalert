export default function Navbar() {
  return (
    <div className="nav-island">
      <div className="nav-logo"><i className="fa-solid fa-satellite-dish"></i>TravelRadar</div>
      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#how">How it works</a>
        <a href="#pricing">Pricing</a>
      </div>
      <div className="nav-right">
        <a href="#" className="nav-login">Log in</a>
        <a href="#pricing" className="btn-primary"><span>Get started</span><span className="icw"><i className="fa-solid fa-arrow-right" style={{ fontSize: '.72rem' }}></i></span></a>
      </div>
      <button className="nav-burger" aria-label="Menu"><i className="fa-solid fa-bars" style={{ fontSize: '.85rem' }}></i></button>
    </div>
  );
}