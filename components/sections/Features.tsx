import type { ReactNode } from "react";
import { Reveal } from "../ui/Reveal";
import { ClubsScreen, HomeScreen, InventoryScreen, LeagueScreen } from "./Screens";

const steps: { n: string; title: string; body: string; bullets: string[]; screen: ReactNode }[] = [
  {
    n: "01",
    title: "Know what's next",
    body: "Your home screen greets you, counts down to your next race, and shows how your week is really going.",
    bullets: ["Next-race countdown", "Weekly activity rhythm", "Quick shortcuts", "Strava connect & sync"],
    screen: <HomeScreen />,
  },
  {
    n: "02",
    title: "Compete every week",
    body: "A pace-based league that resets weekly, with separate boards for 5K, 10K, 21K and 42K.",
    bullets: ["Podium & live rank", "Per-distance boards", "Rank-up coaching tips", "Fresh start every week"],
    screen: <LeagueScreen />,
  },
  {
    n: "03",
    title: "Never run dead shoes",
    body: "Log kilometers per shoe, watch shoe-life drop, and get recommendations by race type and terrain.",
    bullets: ["Shoe cabinet & retirement", "Race-day kit checklist", "Terrain-based picks"],
    screen: <InventoryScreen />,
  },
  {
    n: "04",
    title: "Find your people",
    body: "Browse and join running clubs. Every listed club is reviewed by an admin before it goes live.",
    bullets: ["Member leaderboards", "Owner application flow", "Full club management"],
    screen: <ClubsScreen />,
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-5 py-24 md:px-8">
      <div className="blob right-0 top-1/4 h-96 w-96 bg-mint-bright/15" />
      <div className="mx-auto max-w-7xl space-y-24 md:space-y-40">
        {steps.map((s, i) => (
          <Reveal key={s.n}>
            <article className="grid items-center gap-10 rounded-[2rem] border border-white/10 bg-panel/70 p-6 md:p-12 lg:grid-cols-2">
              <div className={i % 2 ? "lg:order-2" : ""}>
                <p className="headline text-7xl text-mint-bright/90 md:text-8xl">{s.n}</p>
                <h3 className="headline mt-2 text-5xl md:text-6xl">{s.title}</h3>
                <p className="mt-5 max-w-md text-white/60">{s.body}</p>
                <ul className="mt-6 space-y-2.5">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-sm font-semibold text-white/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-mint-bright shadow-[0_0_10px_#3ddc97]" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={i % 2 ? "lg:order-1" : ""}>{s.screen}</div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
