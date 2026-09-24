import { Reveal } from "../ui/Reveal";

const faqs = [
  ["Where does the race data come from?", "A scraper network pulls from the Turkish athletics federation, RunPo, PassTiming and PlusTimer, plus international sources like Finishers, World Athletics label races and the ITRA trail calendar. Duplicates are merged and expired races are cleaned up automatically."],
  ["Is Veira only for Turkey?", "No. It started Turkey-first, but race data is country-tagged, so you see your own country first and can switch on “also show races abroad”."],
  ["How does the weekly league work?", "It ranks runners by average pace, per distance (5K, 10K, 21K, 42K), and resets every week so everyone gets a fresh start."],
  ["How do I list my club or race?", "Apply as an owner in the app. Once an admin approves you, you can list your club and submit races. Submitted races are reviewed before they appear."],
  ["Which languages are supported?", "Turkish and English, with more coverage being added."],
  ["Does it sync with my watch?", "Strava connect and sync works today. Garmin and GPX upload are planned."],
];

export function Faq() {
  return (
    <section id="faq" className="px-5 py-28 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className="headline text-center text-[clamp(3rem,7vw,6rem)]">FAQ&apos;s</h2>
        </Reveal>
        <div className="mt-12 divide-y divide-fg/10 border-y border-fg/10">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-2xl font-bold uppercase tracking-wide">
                {q}
                <span className="text-mint-bright transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-fg/60">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
