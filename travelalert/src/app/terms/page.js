import Link from "next/link";

// Working assumption pending confirmation — change in ONE place if wrong.
const GOVERNING_LAW = "India";
const GOVERNING_COURTS = "courts located in Bengaluru, Karnataka, India";
const LEGAL_CONTACT = "legal@travelradar.live";
const EFFECTIVE_DATE = "September 12, 2026";

export const metadata = {
  title: "Terms of Service | TravelRadar",
  description:
    "The terms governing your use of TravelRadar — a travel-safety briefing tool sourced from public community discussion and summarized by AI.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        ← Home
      </Link>

      <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
        Terms of Service
      </h1>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Effective: {EFFECTIVE_DATE}
      </p>

      <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        These Terms of Service ("Terms") govern your access to and use of
        TravelRadar (the "Service", "we", "us"). By creating an account,
        signing in, or otherwise using the Service you agree to these Terms.
        If you do not agree, do not use the Service.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        1. What TravelRadar is — and is not
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        TravelRadar is an <strong>informational</strong> tool. It collects
        publicly available discussion about travel scams, tourist traps, and
        destination tips, and asks a third-party AI model to summarize that
        discussion into a short briefing. The Service is a research aid only.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        TravelRadar does <strong>not</strong> independently investigate,
        verify, fact-check, audit, or endorse any alert, tip, scam report,
        location, business, individual, or practice shown in the Service. Any
        named place, business, or activity in a briefing reflects what some
        users of an online forum said, not a finding by TravelRadar. The
        appearance of any name does not imply that the underlying claim is
        true or accurate.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        2. Source of content
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Briefings are generated from public community discussion indexed by
        third-party search services, then summarized by a third-party AI
        model. Weather, currency, and exchange-rate information displayed in
        the Service is fetched from third-party public APIs. Content is
        aggregated; it is not authored, reviewed, or approved by TravelRadar
        before it is shown to you.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Because the underlying sources are public posts and automated
        summarization, briefings may be <strong>incomplete, outdated,
        biased, inaccurate, misleading, or wrong</strong>. You should treat
        every briefing as one unverified data point and confirm critical
        information (safety, transport, prices, entry requirements, medical
        conditions) through official channels before acting on it.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        3. No guarantee of accuracy or fitness
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        The Service is provided on an <strong>"as-is"</strong> and
        <strong>"as-available"</strong> basis, without warranty of any kind,
        express or implied, including but not limited to warranties of
        merchantability, fitness for a particular purpose, accuracy,
        completeness, timeliness, or non-infringement. We make no promise
        that any alert, tip, or briefing will be correct, current, or
        applicable to your specific circumstances.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        4. Your responsibility and assumption of risk
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        You are solely responsible for the decisions you make while traveling
        and for how you use (or don't use) the Service. You assume all risk
        associated with acting on, ignoring, or relying on anything shown in
        the Service.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        To the maximum extent permitted by law, TravelRadar is not liable for
        any loss, harm, injury, theft, fraud, scam, financial damage,
        reputational damage, missed travel, or other injury that occurs
        during or in connection with your travel, regardless of whether the
        Service warned of a risk, failed to warn of a risk, warned of a risk
        that did not materialize, or described a risk inaccurately.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        5. Accounts
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        You must provide a valid email address and keep your credentials
        confidential. You are responsible for all activity under your
        account. If you believe your account has been compromised, contact{" "}
        <a
          href={`mailto:${LEGAL_CONTACT}`}
          className="font-semibold text-zinc-900 hover:underline dark:text-white"
        >
          {LEGAL_CONTACT}
        </a>
        .
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        6. Plans, billing, and cancellation
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        TravelRadar offers three access tiers:
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>
          <strong>Explorer (free)</strong> — a limited preview, including a
          fixed number of destination searches per calendar month. No payment
          information is required.
        </li>
        <li>
          <strong>Trip Pass</strong> — a one-time purchase that grants full
          access for 30 days. It does not auto-renew.
        </li>
        <li>
          <strong>Annual</strong> — a subscription billed once per year that
          grants full access while active. It auto-renews unless cancelled.
        </li>
      </ul>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        All payments are processed by our third-party payment processor,{" "}
        <strong>Dodo Payments</strong>. We do not collect or store your full
        card number. Payment processing is subject to the payment processor's
        own terms and privacy policy.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        You may cancel the Annual subscription at any time before its next
        renewal date. Cancellation stops future renewals; access continues
        until the end of the current paid period. Trip Pass purchases are
        one-time and do not renew, so no cancellation is required.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        7. Refunds
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <strong>All sales are final.</strong> Because access to the Service
        begins immediately upon payment and the underlying content is
        delivered digitally, we do not offer refunds, partial refunds, or
        pro-rated refunds for partial billing periods. If you believe you
        were charged in error, contact{" "}
        <a
          href={`mailto:${LEGAL_CONTACT}`}
          className="font-semibold text-zinc-900 hover:underline dark:text-white"
        >
          {LEGAL_CONTACT}
        </a>{" "}
        within 14 days and we will investigate in good faith.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        8. Acceptable use
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        You agree not to: scrape, republish, resell, or systematically
        extract content from the Service; use the Service to harass, defame,
        or target any individual or business; attempt to bypass access
        controls, quotas, or plan restrictions; or use the Service in
        violation of applicable law.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        9. Right to refuse or terminate service
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        We may, at our sole discretion and without prior notice, refuse
        service, suspend, or terminate any account that we believe violates
        these Terms, abuses the Service, or exposes TravelRadar or other
        users to risk. If we terminate an account for a violation of these
        Terms, no refund is owed.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        10. Limitation of liability
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        To the maximum extent permitted by applicable law, TravelRadar's
        total aggregate liability arising out of or relating to these Terms
        or the Service is limited to the greater of (a) the amount you paid
        TravelRadar in the 12 months preceding the event giving rise to the
        claim, or (b) USD 10.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        In no event will TravelRadar be liable for indirect, incidental,
        special, consequential, exemplary, or punitive damages, or for lost
        profits, lost data, lost opportunity, or cost of substitute
        services, even if advised of the possibility of such damages.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        11. Changes to the Service or these Terms
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        We may modify the Service, the plans, the pricing, or these Terms at
        any time. Material changes will be reflected in the effective date
        at the top of this page. Continued use of the Service after a change
        constitutes acceptance of the updated Terms.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        12. Governing law and jurisdiction
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        These Terms are governed by the laws of {GOVERNING_LAW}, without
        regard to its conflict-of-law principles. Any dispute arising out of
        or relating to these Terms or the Service is subject to the
        exclusive jurisdiction of the {GOVERNING_COURTS}.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        13. Contact
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Questions about these Terms:{" "}
        <a
          href={`mailto:${LEGAL_CONTACT}`}
          className="font-semibold text-zinc-900 hover:underline dark:text-white"
        >
          {LEGAL_CONTACT}
        </a>
        .
      </p>

      <p className="mt-10 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-500">
        See also:{" "}
        <Link href="/privacy" className="underline hover:text-zinc-900 dark:hover:text-white">
          Privacy Policy
        </Link>{" "}
        ·{" "}
        <Link href="/disclaimer" className="underline hover:text-zinc-900 dark:hover:text-white">
          Disclaimer
        </Link>
      </p>
    </main>
  );
}