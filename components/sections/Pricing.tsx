"use client";

import Link from "next/link";
import { Reveal } from "../ui/Reveal";
import { useI18n } from "../../lib/i18n/context";

// 0 = no, 1 = yes, "planned"/"adminReview" = translation key for a short note
const rowKeys: [string, (0 | 1 | "planned" | "adminReview")[]][] = [
  ["row1", [1, 1, 1]],
  ["row2", [1, 1, 1]],
  ["row3", [1, 1, 1]],
  ["row4", [1, 1, 1]],
  ["row5", [0, "planned", 0]],
  ["row6", [0, "planned", 0]],
  ["row7", [0, 0, 1]],
  ["row8", [0, 0, "adminReview"]],
];

export function Pricing() {
  const { t } = useI18n();

  const tiers = [
    { name: t("pricing.tier1Name"), tag: t("pricing.tier1Tag"), cta: t("pricing.tier1Cta"), href: "/login?mode=signup", hot: false },
    { name: t("pricing.tier2Name"), tag: t("pricing.tier2Tag"), cta: t("pricing.tier2Cta"), href: "/login?mode=signup", hot: true },
    { name: t("pricing.tier3Name"), tag: t("pricing.tier3Tag"), cta: t("pricing.tier3Cta"), href: "/login?mode=signup", hot: false },
  ];

  const cell = (v: 0 | 1 | "planned" | "adminReview") =>
    v === 1 ? (
      <span className="text-mint-bright">✓</span>
    ) : v === 0 ? (
      <span className="text-fg/20">—</span>
    ) : (
      <span className="text-xs font-bold text-fg/60">{t(`pricing.${v}`)}</span>
    );

  return (
    <section id="pricing" className="relative overflow-x-clip px-5 py-28 md:px-8 md:py-40">
      <div className="blob -right-20 top-20 h-96 w-96 bg-[#b6ff5c]/20" />
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="headline text-center text-[clamp(3rem,7vw,6.5rem)]">
            {t("pricing.headline1")} <span className="grad-text">{t("pricing.headlineGrad")}</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 overflow-x-auto rounded-3xl border border-fg/10 bg-panel/70">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="w-1/4 p-5" />
                  {tiers.map((tier) => (
                    <th key={tier.name} className={`p-5 align-top ${tier.hot ? "bg-mint/25" : ""}`}>
                      <p className="headline text-3xl">{tier.name}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-mint-bright">{tier.tag}</p>
                      <Link
                        href={tier.href}
                        className={`mt-4 inline-block rounded-full px-5 py-2 font-display text-base font-bold uppercase ${
                          tier.hot ? "bg-gradient-to-r from-[#3ddc97] to-[#b6ff5c] text-onmint" : "border border-fg/20 text-fg hover:border-mint-bright"
                        }`}
                      >
                        {tier.cta}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowKeys.map(([key, vals]) => (
                  <tr key={key} className="border-t border-fg/10">
                    <td className="p-4 text-sm font-semibold text-fg/75">{t(`pricing.${key}`)}</td>
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
          <p className="mt-4 text-center text-xs text-fg/40">{t("pricing.footnote")}</p>
        </Reveal>
      </div>
    </section>
  );
}
