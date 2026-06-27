export default function Scamcards() {
  return (
    //   <!-- ── SCAM CARDS ── -->
    <section className="scam-section">
      <div className="container">
        <div className="sec-header-center reveal">
          <div className="sec-label">Live Scam Intelligence</div>
          <h2 className="sec-title">
            Active right now. <span className="grad-red">Updated daily.</span>
          </h2>
          <p className="sec-sub">
            Every alert below is sourced from real Travelers reports this week —
            not a 2019 blog post.
          </p>
        </div>
        <div className="scam-grid reveal">
          <div className="scam-card">
            <div className="sev-bar high"></div>
            <div className  ="scam-top">
              <div className="scam-meta">
                <div className="scam-dest">Bangkok, Thailand 🇹🇭</div>
                <div className="scam-badge badge-h">High Risk</div>
              </div>
              <div className="scam-loss danger">$200</div>
              <div className="scam-loss-lbl">Average victim loss</div>
              <div className="scam-name">Tuk-Tuk Free Temple Tour</div>
            </div>
            <div className="scam-body">
              <p className="scam-desc">
                A friendly local near Grand Palace offers a free tuk-tuk city
                tour. Drives you to gem/tailor shops with extreme pressure to
                buy overpriced items.
              </p>
              <div className="scam-avoid">
                ✓ Refuse all "free tour" offers. Use Grab app only.
              </div>
              <div className="scam-src">
                <span className="src-dot"></span>· reported 4× this week · 847
                upvotes
              </div>
            </div>
          </div>

          <div className="scam-card">
            <div className="sev-bar high"></div>
            <div className="scam-top">
              <div className="scam-meta">
                <div className="scam-dest">Bali, Indonesia 🇮🇩</div>
                <div className="scam-badge badge-h">High Risk</div>
              </div>
              <div className="scam-loss danger">$150</div>
              <div className="scam-loss-lbl">Average victim loss</div>
              <div className  ="scam-name">Motorbike Damage Claim</div>
            </div>
            <div className="scam-body">
              <p className="scam-desc">
                Rented motorbike returned with pre-existing scratches. Owner
                demands $100-200 cash claiming you caused damage. Refuses
                insurance.
              </p>
              <div className    ="scam-avoid">
                ✓ Photo every scratch before riding. Use reputable shops only.
              </div>
              <div className="scam-src">
                <span className="src-dot"></span>· reported 6× this week · 1.2k
                upvotes
              </div>
            </div>
          </div>

          <div className="scam-card">
            <div className="sev-bar medium"></div>
            <div className="scam-top">
              <div className="scam-meta">
                <div className="scam-dest">Prague, Czech Republic 🇨🇿</div>
                <div className="scam-badge badge-m">Medium</div>
              </div>
              <div className="scam-loss danger">$400</div>
              <div className="scam-loss-lbl">Average victim loss</div>
              <div className="scam-name">ATM Skimming Device</div>
            </div>
            <div className="scam-body">
              <p className="scam-desc">
                Card skimmer devices found on ATMs near Old Town Square. Cards
                cloned and drained within hours. Standalone ATMs most targeted.
              </p>
              <div className    ="scam-avoid">
                ✓ Use bank-branch ATMs only. Cover keypad when entering PIN.
              </div>
              <div className="scam-src">
                <span className="src-dot"></span>· confirmed this week · 2.3k
                upvotes
              </div>
            </div>
          </div>

          <div className="scam-card">
            <div className="sev-bar medium"></div>
            <div className="scam-top">
              <div className="scam-meta">
                <div className="scam-dest">Hanoi, Vietnam 🇻🇳</div>
                <div className="scam-badge badge-m">Medium</div>
              </div>
              <div className="scam-loss danger">$25</div>
              <div className="scam-loss-lbl">Average victim loss</div>
              <div className="scam-name">Taxi No Meter Scam</div>
            </div>
            <div className="scam-body">
              <p className="scam-desc">
                Taxi driver claims meter is broken or "fixed price" is better.
                Charges 3-5× fair price. Most common at Noi Bai Airport late at
                night.
              </p>
              <div className    ="scam-avoid">
                ✓ Use Grab app. Agree price before entering. Walk away if
                pressured.
              </div>
              <div className="scam-src">
                <span className="src-dot"></span>· reported 9× this week
              </div>
            </div>
          </div>

          <div className="scam-card">
            <div className="sev-bar medium"></div>
            <div className="scam-top">
              <div className="scam-meta">
                <div className="scam-dest">Rome, Italy 🇮🇹</div>
                <div className="scam-badge badge-m">Medium</div>
              </div>
              <div className="scam-loss danger">$20</div>
              <div className="scam-loss-lbl">Average victim loss</div>
              <div className="scam-name">Bracelet Gift Scam</div>
            </div>
            <div className="scam-body">
              <p className="scam-desc">
                Man near Trevi Fountain ties a bracelet on your wrist calling it
                a gift, then demands aggressive payment. Grabs your hand if you
                try to leave.
              </p>
              <div className="scam-avoid">
                ✓ Keep hands in pockets. Say "No" firmly and keep walking.
              </div>
              <div className="scam-src">
                <span className="src-dot"></span>· reported 11× this week
              </div>
            </div>
          </div>

          <div className="scam-card">
            <div className="sev-bar tip"></div>
            <div className="scam-top">
              <div className="scam-meta">
                <div className="scam-dest">Bangkok, Thailand 🇹🇭</div>
                <div className="scam-badge badge-t">Tip</div>
              </div>
              <div className="scam-loss tip-col">$45</div>
              <div className="scam-loss-lbl">Saved per airport trip using Grab</div>
              <div className="scam-name">Best Transport from Airport</div>
            </div>
            <div className="scam-body">
              <p className="scam-desc">
                Download Grab before landing. Book immediately on arrival. Fixed
                price ~280 THB vs street taxis charging 800-1200 THB. Available
                24/7.
              </p>
              <div className="scam-avoid">
                ✓ Book Grab before leaving arrivals hall. 15 min wait average.
              </div>
              <div className="scam-src">
                <span className="src-dot"></span>· 3.4k upvotes · verified tip
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
