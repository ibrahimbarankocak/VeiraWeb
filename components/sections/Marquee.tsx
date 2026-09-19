const items = [
  "Discover races",
  "Track every shoe",
  "Climb the weekly league",
  "Join verified clubs",
  "Turkey + Europe",
  "Sync with Strava",
];

export function Marquee({ reverse = false }: { reverse?: boolean }) {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-ink py-4">
      <div className={`flex w-max animate-marquee gap-10 whitespace-nowrap ${reverse ? "[animation-direction:reverse]" : ""}`}>
        {[...row, ...row].map((t, i) => (
          <span key={i} className="headline flex items-center gap-10 text-2xl text-white/50">
            {t}
            <span className="text-mint-bright">⚡</span>
          </span>
        ))}
      </div>
    </div>
  );
}
