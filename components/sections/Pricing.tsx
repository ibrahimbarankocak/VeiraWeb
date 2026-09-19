import Link from "next/link";
import { Reveal } from "../ui/Reveal";

const tiers = [
  { name: "Runner", tag: "Free today", cta: "Start free", href: "/login?mode=signup", hot: false },
  { name: "Runner Pro", tag: "Coming soon", cta: "Get notified", href: "/login?mode=signup", hot: true },
  { name: "Club & Event", tag: "By approval", cta: "Apply as owner", href: "/login?mode=signup", hot: false },
];

// 0 = no, 1 = yes, string = note
const rows: [string, (string | number)[]][] = [
  ["Race calendar & filters", [1, 1, 1]],
  ["Weekly league", [1, 1, 1]],
  ["Shoe cabinet & kit checklist", [1, 1, 1]],
  ["Strava sync", [1, 1, 1]],
  ["Garmin & GPX upload", [0, "Planned", 0]],
  ["Advanced insights", [0, "Planned", 0]],
  ["List your club", [0, 0, 1]],
  ["Submit races", [0, 0, "Admin review"]],
];

const cell = (v: string | number) =>
  v === 1 ? <span className="text-mint-bright">✓</span> : v === 0 ? <span className="text-white/20">—</span> : <span className="text-xs font-bold text-white/60">{v}</span>;

export function Pricing() {
  return (
    <section id="pricing" className="relative px-5 py-28 md:px-8 md:py-40">
      <div className="blob -right-20 top-20 h-96 w-96 bg-[#b6ff5c]/20" />
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="headline text-center text-[clamp(3rem,7vw,6.5rem)]">
            Pick your <span className="grad-text">lane</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 overflow-x-auto rounded-3xl border border-white/10 bg-panel/70">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="w-1/4 p-5" />
                  {tiers.map((t) => (
                    <th key={t.name} className={`p-5 align-top ${t.hot ? "bg-mint/25" : ""}`}>
                      <p className="headline text-3xl">{t.name}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-mint-bright">{t.tag}</p>
                      <Link
                        href={t.href}
                        className={`mt-4 inline-block rounded-full px-5 py-2 font-display text-base font-bold uppercase ${
                          t.hot ? "bg-gradient-to-r from-mint-bright to-[#b6ff5c] text-ink" : "border border-white/20 text-white hover:border-mint-bright"
                        }`}
                      >
                        {t.cta}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, vals]) => (
                  <tr key={label} className="border-t border-white/10">
                    <td className="p-4 text-sm font-semibold text-white/75">{label}</td>
                    {vals.map((v, i) => (
                      <td key={i} className={`p-4 text-center ${tiers[i].hot ? "bg-mint/15" : ""}`}>
                        {cell(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-white/40">
            Pro pricing isn&apos;t final yet — everything marked ✓ is free right now.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
