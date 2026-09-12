import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Canonical site URL for SEO / social previews. Falls back to the custom
// domain when NEXT_PUBLIC_SITE_URL is not configured in an environment.
function siteUrl() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://travelradar.live");
  } catch {
    return new URL("https://travelradar.live");
  }
}

export const metadata = {
  metadataBase: siteUrl(),
  title: "TravelRadar",
  description: "Live scam intel before you land.",
  openGraph: {
    siteName: "TravelRadar",
    type: "website",
    url: "/",
  },
};

// Runs before paint to avoid a flash of the wrong theme. Default is light —
// the class is added only when the user has explicitly chosen dark.
const themeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem("travelradar-theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {}
})();
`;

// GA4 measurement ID. NEXT_PUBLIC_* values are inlined at build time and are
// public by design (they ship in the client bundle), so this is not a secret.
// When the env var is absent — local dev, CI, preview without the flag — the
// Script blocks below are simply not rendered.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}