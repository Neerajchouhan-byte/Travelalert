import Link from "next/link";

const PRIVACY_CONTACT = "privacy@travelradar.live";
const EFFECTIVE_DATE = "September 12, 2026";

export const metadata = {
  title: "Privacy Policy | TravelRadar",
  description:
    "How TravelRadar collects, uses, and shares personal data — including the third-party services that data passes through.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        ← Home
      </Link>

      <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
        Privacy Policy
      </h1>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Effective: {EFFECTIVE_DATE}
      </p>

      <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        This Privacy Policy explains what TravelRadar ("we", "us") collects,
        why, and how it is shared. It applies to the TravelRadar web
        application and any related services.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        1. What we collect
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>
          <strong>Account information.</strong> Your email address, and a
          hashed password. Both are managed by our authentication provider,
          Supabase. If you sign in through a third-party identity provider,
          we receive the email address that provider shares.
        </li>
        <li>
          <strong>Profile information.</strong> A display name (if you
          provide one) and an optional avatar URL.
        </li>
        <li>
          <strong>Usage data.</strong> The cities you search, timestamps of
          those searches, and a monthly counter of how many free searches
          you have used. This is used to enforce the Explorer plan limit and
          to prevent abuse.
        </li>
        <li>
          <strong>Billing state.</strong> Whether your account has an active
          Trip Pass or Annual plan, and the identifier of your subscription
          as recorded by our payment processor. We do{" "}
          <strong>not</strong> store your card number, CVV, or full payment
          credentials.
        </li>
        <li>
          <strong>Local preferences.</strong> A theme preference (light/dark)
          is stored in your browser's local storage. It is not transmitted
          to our servers.
        </li>
        <li>
          <strong>Basic technical data.</strong> IP address and request
          metadata may be logged by our hosting provider for security and
          rate-limiting purposes.
        </li>
      </ul>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        2. How we use it
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>To sign you in and keep you signed in.</li>
        <li>To serve the destination briefing you requested.</li>
        <li>To enforce plan limits and prevent abuse.</li>
        <li>To process upgrades and manage your subscription.</li>
        <li>To communicate with you about your account when necessary.</li>
      </ul>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        3. Third parties your data passes through
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        TravelRadar relies on the following third-party services. Data is
        shared with them only to the extent needed for the Service to
        function.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>
          <strong>Supabase</strong> — database and authentication. Stores
          your account, profile, search history, and subscription state.
        </li>
        <li>
          <strong>Dodo Payments</strong> — payment processing for Trip Pass
          and Annual plans. Receives your email and payment details required
          to complete the transaction. TravelRadar does not receive or store
          your full card number.
        </li>
        <li>
          <strong>Google Gemini</strong> — AI summarization. Public
          community discussion snippets about a destination are sent to
          Gemini to be summarized. Personal data about you (email, account
          ID, payment information) is <strong>not</strong> included in those
          requests. Only the destination name and public text snippets are
          sent.
        </li>
        <li>
          <strong>Serper.dev / Google search index</strong> — used to
          discover public community discussion about a destination. Only the
          destination name is sent as the query; no personal data is
          included.
        </li>
        <li>
          <strong>Reddit</strong> — the original source of much of the
          content that appears in briefings. TravelRadar does not query
          Reddit directly; Reddit content is discovered through search
          indexing.
        </li>
        <li>
          <strong>Open-Meteo</strong> — geocoding and weather data used by
          the destination weather panel. Only the destination name and
          coordinates are sent; no personal data is included.
        </li>
        <li>
          <strong>open.er-api.com</strong> — exchange rates used by the
          currency panel. Only a base currency code is requested; no
          personal data is included.
        </li>
        <li>
          <strong>Google Analytics (GA4)</strong> — if configured on this
          deployment, anonymous usage analytics (page views, session
          metadata). It is loaded with your browser's standard cookie
          behavior and is not used to serve targeted advertising.
        </li>
      </ul>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        4. What we do not do
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>
          We do <strong>not</strong> sell your email address, search history,
          or any other personal information.
        </li>
        <li>We do not store full card numbers or CVVs on our servers.</li>
        <li>
          We do not use the content of your account or your searches to
          train machine-learning models.
        </li>
        <li>We do not serve third-party display advertising.</li>
      </ul>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        5. Data retention
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Account, profile, and billing-state records are retained for as long
        as your account is active, plus a short period afterwards to satisfy
        legal, tax, and accounting obligations. Cached destination briefings
        are stored separately from user accounts and do not contain personal
        data.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        6. Your rights
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Depending on where you live, you may have the right to:
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>Access a copy of the personal data we hold about you.</li>
        <li>Correct inaccurate data.</li>
        <li>Delete your account and the personal data associated with it.</li>
        <li>Object to or restrict certain processing.</li>
        <li>Receive your data in a portable format.</li>
      </ul>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        To exercise any of these rights, email{" "}
        <a
          href={`mailto:${PRIVACY_CONTACT}`}
          className="font-semibold text-zinc-900 hover:underline dark:text-white"
        >
          {PRIVACY_CONTACT}
        </a>{" "}
        from the address on your TravelRadar account. We will respond within
        30 days.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        7. Cookies and local storage
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        We use a small number of first-party cookies and browser storage
        entries: a Supabase session cookie to keep you signed in, and a
        local-storage key for your theme preference. If Google Analytics is
        enabled on this deployment, its own cookies are set for anonymous
        analytics. We do not run advertising cookies.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        8. Children
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        The Service is not directed at children. If you are below the age at
        which you can consent to online services in your jurisdiction, do
        not create an account.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        9. Changes to this policy
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        We may update this Privacy Policy from time to time. The effective
        date at the top of this page will be updated when we do. Material
        changes will be reflected prominently in the Service.
      </p>

      <h2 className="mt-8 text-lg font-bold text-zinc-900 dark:text-white">
        10. Contact
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Questions or requests:{" "}
        <a
          href={`mailto:${PRIVACY_CONTACT}`}
          className="font-semibold text-zinc-900 hover:underline dark:text-white"
        >
          {PRIVACY_CONTACT}
        </a>
        .
      </p>

      <p className="mt-10 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-500">
        See also:{" "}
        <Link href="/terms" className="underline hover:text-zinc-900 dark:hover:text-white">
          Terms of Service
        </Link>{" "}
        ·{" "}
        <Link href="/disclaimer" className="underline hover:text-zinc-900 dark:hover:text-white">
          Disclaimer
        </Link>
      </p>
    </main>
  );
}