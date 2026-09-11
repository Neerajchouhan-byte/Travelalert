import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Features from "@/components/Features";
import Howitwork from "@/components/Howitwork";
import SignalOverview from "@/components/SignalOverview";
import Scamcards from "@/components/Scamcards";
import Pricing from "@/components/Pricing";
import Cta from "@/components/Cta";
import { HomeRevealObserver } from "@/components/HomeRevealObserver";

export const metadata = {
  title: "TravelRadar — Live Scam Intel Before You Land",
  description:
    "Real traveler reports, organized by AI. Check tourist scams, transit traps, and insider tips for any destination before you arrive. Free to start.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "TravelRadar — Live Scam Intel Before You Land",
    description:
      "Real traveler reports, organized by AI. Check tourist scams, transit traps, and insider tips for any destination before you arrive.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelRadar — Live Scam Intel Before You Land",
    description:
      "Real traveler reports, organized by AI. Check tourist scams, transit traps, and insider tips for any destination before you arrive.",
  },
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://travelradar.live";

// SoftwareApplication schema — describes the product itself for rich results.
const appSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TravelRadar",
  applicationCategory: "TravelApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "Real traveler reports, organized by AI. Check tourist scams, transit traps, and insider tips for any destination before you arrive.",
  offers: [
    {
      "@type": "Offer",
      name: "Explorer",
      price: "0",
      priceCurrency: "USD",
      description: "3 destination searches, preview of top alerts and tips.",
    },
    {
      "@type": "Offer",
      name: "Trip Pass",
      price: "7",
      priceCurrency: "USD",
      description: "Unlimited destinations for 30 days.",
    },
    {
      "@type": "Offer",
      name: "Annual",
      price: "29",
      priceCurrency: "USD",
      description: "Unlimited destinations for a full year.",
    },
  ],
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f6f2] text-zinc-900 transition-colors duration-200 dark:bg-[#0c0c0e] dark:text-[#f3f3f2]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <Howitwork />
      <SignalOverview />
      <Scamcards />
      <Pricing />
      <Cta />
      <Footer />
      <HomeRevealObserver />
    </main>
  );
}