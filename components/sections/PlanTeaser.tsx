"use client";

import Link from "next/link";
import { Reveal } from "../ui/Reveal";
import { PlanScreen } from "./Screens";
import { useI18n } from "../../lib/i18n/context";
import { trackSignupClick } from "../../lib/gtag";

export function PlanTeaser() {
  const { t } = useI18n();
  const points = [t("plan.point1"), t("plan.point2"), t("plan.point3")];

  return (
    <section id="plan" className="relative overflow-x-clip px-5 py-28 md:px-8 md:py-40">
      <div className="blob right-0 top-1/4 h-[30rem] w-[30rem] bg-[#b6ff5c]/20" />
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[auto_1fr]">
        <Reveal delay={0.1} className="order-2 lg:order-1">
          <PlanScreen />
        </Reveal>

        <Reveal className="order-1 lg:order-2">
          <p className="eyebrow mb-4">{t("plan.eyebrow")}</p>
          <h2 className="headline text-[clamp(3.2rem,8vw,7.5rem)]">
            {t("plan.headline1")}
            <br />
            <span className="grad-text">{t("plan.headlineGrad")}</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg text-fg/60">{t("plan.body")}</p>
          <ul className="mt-8 grid max-w-lg gap-3 text-sm font-semibold text-fg/80">
            {points.map((pt) => (
              <li key={pt} className="rounded-xl border border-fg/10 bg-fg/[0.03] px-4 py-3">
                {pt}
              </li>
            ))}
          </ul>
          <Link href="/login?mode=signup" className="btn-mint mt-8" onClick={() => trackSignupClick("plan_teaser_cta")}>
            {t("plan.cta")}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
