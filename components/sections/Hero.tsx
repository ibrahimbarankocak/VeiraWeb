import Link from "next/link";
import { Reveal } from "../ui/Reveal";

const stats = [
  ["5K → ULTRA", "every distance"],
  ["TR + EU", "country-tagged races"],
  ["WEEKLY", "league resets"],
  ["3 SOURCES+", "official federations"],
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-5 pb-24 pt-40 text-center md:px-8 md:pt-52">
      <div className="blob -left-40 top-10 h-[34rem] w-[34rem] animate-drift bg-mint-bright/40" />
      <div className="blob -right-32 top-64 h-[28rem] w-[28rem] animate-drift bg-[#b6ff5c]/25 [animation-delay:-6s]" />
      <div className="dotgrid absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]" />

      <Reveal>
        <p className="eyebrow mb-6">The running companion</p>
        <h1 className="headline mx-auto max-w-[95rem] text-[clamp(3rem,8.6vw,9rem)]">
          The smartest way to
          <br />
          <span className="grad-text">find your next race</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg text-white/65 md:text-xl">
          Discover races, track every kilometer on every shoe, and climb the weekly league — all in one app built
          by runners, for runners.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/login?mode=signup" className="btn-mint">
            Join Veira free
          </Link>
          <a
            href="/races"
            className="rounded-full border border-white/20 px-7 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-white transition hover:border-mint-bright hover:text-mint-bright"
          >
            See the race calendar
          </a>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <dl className="mx-auto mt-24 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
          {stats.map(([a, b]) => (
            <div key={a} className="bg-ink/80 px-4 py-6">
              <dt className="headline text-3xl text-mint-bright md:text-4xl">{a}</dt>
              <dd className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/45">{b}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
