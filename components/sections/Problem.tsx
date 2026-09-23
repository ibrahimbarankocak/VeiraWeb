import { Reveal } from "../ui/Reveal";

const pains = [
  ["Race info is scattered", "Federation sites, ticket pages and Instagram posts — nothing in one place."],
  ["Nobody tracks shoe mileage", "You find out a pair is dead when your knees tell you."],
  ["Training feels solo", "No one to chase, no weekly stakes, no reason to push that last 6 sec/km."],
  ["Clubs are hard to trust", "Anyone can list anything. Real clubs get buried."],
];

function Blocks({ flip = false }: { flip?: boolean }) {
  // Pixel "skyline" transition between sections, deterministic so SSR matches the client.
  const heights = [3, 5, 4, 7, 6, 9, 8, 11, 10, 13, 12, 14, 12, 15, 13, 16, 14, 12, 13, 10, 11, 8, 9, 6, 7, 5, 6, 4, 3, 5, 4, 2];
  return (
    <div className={`flex h-56 items-end ${flip ? "rotate-180" : ""}`} aria-hidden>
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1"
          style={{
            height: `${h * 6.2}%`,
            background: `linear-gradient(to top, #b6ff5c, #3ddc97 ${40 + h * 2}%, #0d3a26)`,
          }}
        />
      ))}
    </div>
  );
}

export function Problem() {
  return (
    <>
      <section className="relative px-5 py-28 md:px-8 md:py-40">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <h2 className="headline text-[clamp(3rem,7vw,6.5rem)]">
              You&apos;re busy
              <br />
              training for
              <br />
              the race you <span className="grad-text glow-text">love</span>.
            </h2>
            <p className="mt-6 max-w-md text-white/60">
              Planning it shouldn&apos;t be the hardest part of the season.
            </p>
          </Reveal>

          <ul className="divide-y divide-white/10 border-y border-white/10">
            {pains.map(([t, d], i) => (
              <li key={t}>
                <Reveal delay={i * 0.08}>
                  <div className="py-6">
                    <p className="headline text-2xl text-mint-bright md:text-3xl">{t}</p>
                    <p className="mt-2 text-sm text-white/55">{d}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="relative">
        <Blocks />
        <div className="bg-gradient-to-b from-[#b6ff5c] via-[#3ddc97] to-ink px-5 pb-40 pt-16 text-center">
          <Reveal>
            <h2 className="headline text-[clamp(3.5rem,9vw,8rem)] text-ink">
              There&apos;s a<br />better way
            </h2>
          </Reveal>
        </div>
        <div className="-mt-1 bg-ink">
          <Blocks flip />
        </div>
      </div>
    </>
  );
}
