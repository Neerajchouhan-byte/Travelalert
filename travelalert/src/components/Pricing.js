export default function Pricing() {
  return (
    // <!-- ── PRICING ── -->
    <section className="pricing-section" id="pricing">
      <div className="container">
        <div className="sec-header-center reveal">
          <div className="sec-label">Simple Pricing</div>
          <h2 className="sec-title">Less than one coffee.</h2>
        </div>
        {/* <!-- PSYCHOLOGY: Price anchoring --> */}
        <div className="price-anchor reveal">
          The average scam in Southeast Asia costs <strong>$180.</strong>
          <span className="vs">vs</span>
          TravelRadar Pro costs <span className="good">$9/month.</span> One
          prevented scam pays for <strong>20 months</strong> of the
          subscription.
        </div>
        <div className="pricing-grid">
          <div className="price-card reveal">
            <span className="plan-name">Explorer</span>
            <div className="plan-price">
              <span className="p-cur">$</span>
              <span className="p-amt">0</span>
              <span className="p-per">/month</span>
            </div>
            <p className="plan-desc">
              Try it before your next trip. No credit card required.
            </p>
            <ul className="plan-feats">
              <li className="plan-feat">
                <span className="p-check">✓</span>3 destination searches/month
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>2 scam alerts per destination
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>Basic food + transport tips
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>Live currency rates
              </li>
              <li className="plan-feat locked">
                <span className="p-lock">✕</span>Full alerts library
              </li>
              <li className="plan-feat locked">
                <span className="p-lock">✕</span>Pre-trip email digest
              </li>
              <li className="plan-feat locked">
                <span className="p-lock">✕</span>Offline access
              </li>
            </ul>
            <a href="#" className="btn btn-glass btn-full">
              Start Exploring Free
            </a>
            {/* <!-- PSYCHOLOGY: Risk of NOT upgrading --> */}
            <div className="risk-note">
              <span>⚠</span>
              Free users miss 80% of active scam alerts. Most scam victims had
              no protection.
            </div>
          </div>
          <div className="price-card feat-card-p reveal">
            <span className="plan-name">Traveler Pro</span>
            <div className="plan-price">
              <span className="p-cur">$</span>
              <span className="p-amt">9</span>
              <span className="p-per">/month</span>
            </div>
            <p className="plan-desc">
              Less than one street food meal. Protects your whole trip.
            </p>
            <ul className="plan-feats">
              <li className="plan-feat">
                <span className="p-check">✓</span>Unlimited destinations
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>All scam alerts — updated daily
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>Full tips library — all categories
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>Live currency + weather alerts
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>Offline destination guides
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>Pre-trip email 3 days before you
                fly
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>Reddit pulse — weekly scam report
              </li>
            </ul>
            <a href="#" className="btn btn-accent btn-full">
              Start My 14-Day Protection
            </a>
            <p className="plan-note">
              No credit card · Cancel anytime · Smart travelers never skip this
            </p>
          </div>
          <div className="price-card feat-card-p reveal">
            <div className="pop-badge">Most Popular</div>
            <span className="plan-name">Traveler Ultimate</span>
            <div className="plan-price">
              <span className="p-cur">$</span>
              <span className="p-amt">79</span>
              <span className="p-per">/Once</span>
            </div>
            <p className="plan-desc">
              Pay once. Get lifetime access to every current and future Pro
              feature.
            </p>
            <ul className="plan-feats">
              <li className="plan-feat">
                <span className="p-check">✓</span>Everything in Traveler Pro
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>Lifetime access
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>All future feature updates
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>Priority support
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>Exclusive monthly travel
                intelligence reports
              </li>
              <li className="plan-feat">
                <span className="p-check">✓</span>Premium scam alert notifications
              </li>
            </ul>
            <a href="#" className="btn btn-accent btn-full">
              Pay Once, Travel Forever
            </a>
            <p className="plan-note">
              No credit card · Cancel anytime · Smart travelers never skip this
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
