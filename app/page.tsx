import { Navbar } from "../components/sections/Navbar";
import { Problem } from "../components/sections/Problem";
import { Marquee } from "../components/sections/Marquee";
import { RaceCalendar } from "../components/sections/RaceCalendar";
import { Pricing } from "../components/sections/Pricing";
import { Faq } from "../components/sections/Faq";
import { FinalCta, Footer } from "../components/sections/Footer";
import { HeroStats, HeroTunnel } from "../components/scenes/HeroTunnel";
import { PhoneRise } from "../components/scenes/PhoneRise";
import { RaceCollage, type CollageRace } from "../components/scenes/RaceCollage";
import { FooterReveal } from "../components/scenes/FooterReveal";
import { getRaces, type Race } from "../lib/races";

export const revalidate = 3600;

// itra.run answers hotlinked image requests with a bot-check page, so its photos never render on other sites.
const UNLOADABLE_IMAGE_HOSTS = ["itra.run"];
const hasLoadableImage = (r: Race) => {
  if (!r.image) return false;
  try {
    return !UNLOADABLE_IMAGE_HOSTS.includes(new URL(r.image).host);
  } catch {
    return false;
  }
};

/** Up to six soonest races, preferring ones with a loadable photo and spreading them across countries. */
function pickCollage(races: Race[]): CollageRace[] {
  const sorted = [...races]
    .filter((r) => !/(^|[^a-z])test([^a-z]|$)/i.test(`${r.name} ${r.nameLocal}`))
    .sort((a, b) => a.date.localeCompare(b.date));
  const picked: Race[] = [];
  const countries = new Set<string>();
  for (const r of sorted) {
    if (picked.length >= 6) break;
    if (hasLoadableImage(r) && !countries.has(r.country)) {
      picked.push(r);
      countries.add(r.country);
    }
  }
  for (const r of sorted) {
    if (picked.length >= 6) break;
    if (!picked.includes(r)) picked.push(r);
  }
  return picked.map((r) => ({
    id: r.id,
    name: r.name,
    date: r.date,
    country: r.country,
    image: hasLoadableImage(r) ? r.image : null,
  }));
}

export default async function HomePage() {
  let races: Race[] = [];
  try {
    races = await getRaces();
  } catch {
    // The rest of the page works without race data; the collage simply stays empty.
  }

  return (
    <main>
      <Navbar />
      <FooterReveal footer={<Footer />}>
        <HeroTunnel />
        <div className="px-5 pb-16 md:px-8">
          <HeroStats />
        </div>
        <Marquee />
        <Problem />
        <PhoneRise />
        <Marquee reverse />
        <RaceCalendar />
        {races.length > 0 && <RaceCollage races={pickCollage(races)} total={races.length} />}
        <Pricing />
        <Faq />
        <FinalCta />
      </FooterReveal>
    </main>
  );
}
