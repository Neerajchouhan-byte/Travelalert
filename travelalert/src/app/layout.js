import { Geist, Geist_Mono } from "next/font/google";
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
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}