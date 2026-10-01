"use client";

import { Reveal } from "../ui/Reveal";
import { MotionAccordion } from "../ui/motion-faqs-accordion";
import { useI18n } from "../../lib/i18n/context";

export function Faq() {
  const { t } = useI18n();
  const faqs = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
    { question: t("faq.q6"), answer: t("faq.a6") },
  ];

  return (
    <section id="faq" className="px-5 py-28 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className="headline text-center text-[clamp(3rem,7vw,6rem)]">{t("faq.heading")}</h2>
        </Reveal>
        <div className="mt-12">
          <MotionAccordion items={faqs} />
        </div>
      </div>
    </section>
  );
}
