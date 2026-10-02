"use client";

import Link from "next/link";
import { Reveal } from "../ui/Reveal";
import { ClubsScreen } from "./Screens";
import { AuroraBars } from "../ui/aurora-bars";
import { useI18n } from "../../lib/i18n/context";
import { trackSignupClick } from "../../lib/gtag";

export function ClubsTeaser() {
  const { t } = useI18n();
  const points = [t("clubs.point1"), t("clubs.point2"), t("clubs.point3")];

  return (
    <section id="clubs" className="relative overflow-x-clip px-5 py-28 md:px-8 md:py-40">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[26rem] opacity-40">
        <AuroraBars barCount={32} background="transparent" />
      </div>
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow mb-4">{t("clubs.eyebrow")}</p>
          <h2 className="headline text-[clamp(3.2rem,8vw,7.5rem)]">
            {t("clubs.headline1")}
            <br />
            <span className="grad-text">{t("clubs.headlineGrad")}</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg text-fg/60">{t("clubs.body")}</p>
          <ul className="mt-8 grid max-w-lg gap-3 text-sm font-semibold text-fg/80">
            {points.map((pt) => (
              <li key={pt} className="rounded-xl border border-fg/10 bg-fg/[0.03] px-4 py-3">
                {pt}
              </li>
            ))}
          </ul>
          <Link href="/login?mode=signup" className="btn-mint mt-8" onClick={() => trackSignupClick("clubs_teaser_cta")}>
            {t("clubs.cta")}
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <ClubsScreen />
        </Reveal>
      </div>
    </section>
  );
}
