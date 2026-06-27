import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Features from "@/components/Features";
import Test from "@/components/Test";
import Cta from "@/components/Cta";
import Howitwork from "@/components/Howitwork";
import Pricing from "@/components/Pricing";
import Stats from "@/components/Stats";
import Scamcards from "@/components/Scamcards";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <Howitwork />
      <Stats />
      <Scamcards />
      <Pricing />
      <Test />
      <Cta />
      <Footer />
    </>
  );
}
