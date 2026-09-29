"use client";

import { Reveal } from "../ui/Reveal";
import { useI18n } from "../../lib/i18n/context";

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
  const { t } = useI18n();
  const pains = [
    [t("problem.pain1Title"), t("problem.pain1Body")],
    [t("problem.pain2Title"), t("problem.pain2Body")],
    [t("problem.pain3Title"), t("problem.pain3Body")],
    [t("problem.pain4Title"), t("problem.pain4Body")],
  ];

  return (
    <>
      <section className="relative px-5 py-28 md:px-8 md:py-40">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <h2 className="headline text-[clamp(3rem,7vw,6.5rem)]">
              {t("problem.headline1")}
              <br />
              {t("problem.headline2")}
              <br />
              {t("problem.headline3")} <span className="grad-text glow-text">{t("problem.headline3Grad")}</span>
            </h2>
            <p className="mt-6 max-w-md text-fg/60">{t("problem.sub")}</p>
          </Reveal>

          <ul className="divide-y divide-fg/10 border-y border-fg/10">
            {pains.map(([title, body], i) => (
              <li key={title}>
                <Reveal delay={i * 0.08}>
                  <div className="py-6">
                    <p className="headline text-2xl text-mint-bright md:text-3xl">{title}</p>
                    <p className="mt-2 text-sm text-fg/55">{body}</p>
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
            <h2 className="headline text-[clamp(3.5rem,9vw,8rem)] text-onmint">
              {t("problem.betterWay1")}
              <br />
              {t("problem.betterWay2")}
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
