"use client";

import Link from "next/link";
import { Reveal } from "../ui/Reveal";
import { PhoneShot } from "../ui/PhoneFrame";
import { useI18n } from "../../lib/i18n/context";

export function RaceCalendar() {
  const { t } = useI18n();

  return (
    <section id="calendar" className="relative overflow-x-clip px-5 py-28 md:px-8 md:py-40">
      <div className="blob left-0 top-1/3 h-[32rem] w-[32rem] bg-mint/40" />
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1fr_auto]">
        <Reveal>
          <p className="eyebrow mb-4">{t("raceCalendarTeaser.eyebrow")}</p>
          <h2 className="headline text-[clamp(3.2rem,8vw,7.5rem)]">
            {t("raceCalendarTeaser.headline1")}
            <br />
            <span className="grad-text">{t("raceCalendarTeaser.headlineGrad")}</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg text-fg/60">{t("raceCalendarTeaser.body")}</p>
          <ul className="mt-8 grid max-w-lg grid-cols-2 gap-3 text-sm font-semibold text-fg/80">
            {[t("raceCalendarTeaser.point1"), t("raceCalendarTeaser.point2"), t("raceCalendarTeaser.point3"), t("raceCalendarTeaser.point4")].map(
              (pt) => (
                <li key={pt} className="rounded-xl border border-fg/10 bg-fg/[0.03] px-4 py-3">
                  {pt}
                </li>
              )
            )}
          </ul>
          <Link href="/races" className="btn-mint mt-8">
            {t("raceCalendarTeaser.cta")}
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <PhoneShot src="/screens/races.webp" alt="Veira race calendar with curated upcoming starts" className="max-w-[360px]" />
        </Reveal>
      </div>
    </section>
  );
}
