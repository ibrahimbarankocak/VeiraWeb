"use client";

import { useI18n } from "../../lib/i18n/context";

export function RacesIntro({ count, countries }: { count: number; countries: number }) {
  const { t, lang } = useI18n();
  const locale = lang === "tr" ? "tr-TR" : lang === "es" ? "es-ES" : "en-US";
  return (
    <div className="relative mx-auto max-w-7xl">
      <p className="eyebrow mb-3">{t("racesPage.eyebrow")}</p>
      <h1 className="headline text-[clamp(3rem,8vw,7rem)]">
        {t("racesPage.headline1")} <span className="grad-text">{t("racesPage.headlineGrad")}</span>
      </h1>
      <p className="mt-4 max-w-xl text-fg/60">
        {t("racesPage.subtitle", { n: count.toLocaleString(locale), countries })}
      </p>
    </div>
  );
}
