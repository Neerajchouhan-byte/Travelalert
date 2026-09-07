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

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Font Awesome CDN removed — all icons now use local lucide-react */}
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}