import type { Metadata } from "next";
import { Navbar } from "../../components/sections/Navbar";
import { Footer } from "../../components/sections/Footer";
import { RaceExplorer } from "../../components/races/RaceExplorer";
import { getRaces } from "../../lib/races";

export const metadata: Metadata = {
  title: "Race calendar — Veira",
  description: "Every upcoming running race in Türkiye and abroad. Search, filter by distance and terrain, and sort.",
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
        <div className="relative mx-auto max-w-7xl">
          <p className="eyebrow mb-3">Race calendar</p>
          <h1 className="headline text-[clamp(3rem,8vw,7rem)]">
            Find your <span className="grad-text">next start line</span>
          </h1>
          <p className="mt-4 max-w-xl text-white/60">
            {races.length.toLocaleString("en-US")} upcoming races across {countries} countries, updated hourly.
          </p>
        </div>
      </section>
      <section className="px-5 pb-28 md:px-8">
        <RaceExplorer races={races} />
      </section>
      <Footer />
    </main>
  );
}
