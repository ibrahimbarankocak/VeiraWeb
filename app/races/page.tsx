import type { Metadata } from "next";
import { Navbar } from "../../components/sections/Navbar";
import { Footer } from "../../components/sections/Footer";
import { RaceExplorer } from "../../components/races/RaceExplorer";
import { RacesIntro } from "../../components/races/RacesIntro";
import { getRaces } from "../../lib/races";

export const metadata: Metadata = {
  title: "Yarış takvimi — Veira",
  description: "Türkiye'de ve yurt dışında yaklaşan her yarış, tek takvimde — aranabilir, filtrelenebilir, sıralanabilir.",
};

export const revalidate = 3600;

export default async function RacesPage() {
  const races = await getRaces();
  const countries = new Set(races.map((r) => r.country)).size;

  return (
    <main>
      <Navbar />
      <section className="relative overflow-hidden px-5 pb-6 pt-32 md:px-8 md:pt-40">
        <div className="blob -left-40 top-0 h-[28rem] w-[28rem] bg-mint-bright/25" />
        <RacesIntro count={races.length} countries={countries} />
      </section>
      <section className="px-5 pb-28 md:px-8">
        <RaceExplorer races={races} />
      </section>
      <Footer />
    </main>
  );
}
