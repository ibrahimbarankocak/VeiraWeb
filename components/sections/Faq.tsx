"use client";

import { Reveal } from "../ui/Reveal";
import { useI18n } from "../../lib/i18n/context";

export function Faq() {
  const { t } = useI18n();
  const faqs = [
    [t("faq.q1"), t("faq.a1")],
    [t("faq.q2"), t("faq.a2")],
    [t("faq.q3"), t("faq.a3")],
    [t("faq.q4"), t("faq.a4")],
    [t("faq.q5"), t("faq.a5")],
    [t("faq.q6"), t("faq.a6")],
  ];

  return (
    <section id="faq" className="px-5 py-28 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className="headline text-center text-[clamp(3rem,7vw,6rem)]">{t("faq.heading")}</h2>
        </Reveal>
        <div className="mt-12 divide-y divide-fg/10 border-y border-fg/10">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-2xl font-bold uppercase tracking-wide">
                {q}
                <span className="text-mint-bright transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-fg/60">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
