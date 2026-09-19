import { Navbar } from "../components/sections/Navbar";
import { Hero } from "../components/sections/Hero";
import { Problem } from "../components/sections/Problem";
import { Features } from "../components/sections/Features";
import { Marquee } from "../components/sections/Marquee";
import { RaceCalendar } from "../components/sections/RaceCalendar";
import { Pricing } from "../components/sections/Pricing";
import { Faq } from "../components/sections/Faq";
import { FinalCta, Footer } from "../components/sections/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Marquee />
      <Problem />
      <Features />
      <Marquee reverse />
      <RaceCalendar />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
