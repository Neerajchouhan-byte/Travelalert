export default function PrivacyPage() {
  return (
    <main className="container" style={{ maxWidth: 720, padding: "80px 20px" }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: September 5, 2026</p>
      <p>
        TravelRadar (“we”) provides destination safety briefings. This page
        explains what we collect and why.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Email and password when you create an account (handled by Supabase Auth).</li>
        <li>The city you search, so we can show the right briefing.</li>
        <li>Plan status (free, pro, lifetime) after you pay.</li>
        <li>Payment details are collected by Lemon Squeezy, not stored on our servers.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To log you in and remember your plan.</li>
        <li>To generate and cache city briefings.</li>
        <li>To process upgrades.</li>
      </ul>
      <h2>What we do not do</h2>
      <ul>
        <li>We do not sell your email list.</li>
        <li>We do not store card numbers.</li>
      </ul>
      <h2>Contact</h2>
      <p>Questions: use the email on your TravelRadar account.</p>
    </main>
  );
}