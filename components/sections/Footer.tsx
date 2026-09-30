"use client";

import Link from "next/link";
import { Reveal } from "../ui/Reveal";
import { Logo } from "../ui/Brand";
import { useI18n } from "../../lib/i18n/context";

export function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden px-5 py-32 text-center md:px-8">
      <div className="blob left-[calc(50%-20rem)] top-0 h-[30rem] w-[40rem] bg-mint-bright/30" />
      <Reveal>
        <h2 className="headline mx-auto max-w-4xl text-[clamp(3.4rem,9vw,8rem)]">
          {t("finalCta.headline1")}
          <br />
          <span className="grad-text">{t("finalCta.headlineGrad")}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-fg/60">{t("finalCta.body")}</p>
        <Link href="/login?mode=signup" className="btn-mint mt-10">
          {t("finalCta.cta")}
        </Link>
      </Reveal>
    </section>
  );
}

const colTitle = "mb-3 font-display text-lg font-bold uppercase tracking-wide text-fg";
const colLink = "block py-0.5 hover:text-fg";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="overflow-hidden border-t border-fg/10 px-5 pt-14 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
        <div className="flex flex-col items-center lg:items-start">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-fg/50">{t("footer.tagline")}</p>
        </div>

        <div className="grid w-full max-w-md grid-cols-2 justify-items-center gap-8 lg:w-auto lg:max-w-none lg:justify-items-start lg:gap-24">
          <nav className="text-sm text-fg/60" aria-label="Product">
            <p className={colTitle}>{t("footer.productHeading")}</p>
            <Link href="/#features" className={colLink}>{t("footer.linkFeatures")}</Link>
            <Link href="/#plan" className={colLink}>{t("footer.linkPlan")}</Link>
            <Link href="/#clubs" className={colLink}>{t("footer.linkClubs")}</Link>
            <Link href="/races" className={colLink}>{t("footer.linkCalendar")}</Link>
            <Link href="/#pricing" className={colLink}>{t("footer.linkPricing")}</Link>
          </nav>
          <nav className="text-sm text-fg/60" aria-label="Account">
            <p className={colTitle}>{t("footer.accountHeading")}</p>
            <Link href="/login" className={colLink}>{t("footer.linkLogin")}</Link>
            <Link href="/login?mode=signup" className={colLink}>{t("footer.linkSignup")}</Link>
            <Link href="/profile" className={colLink}>{t("footer.linkProfile")}</Link>
            <Link href="/#faq" className={colLink}>{t("footer.linkFaq")}</Link>
          </nav>
        </div>
      </div>

        <p
          className="headline select-none pt-10 text-center text-[clamp(8rem,32vw,30rem)] lowercase leading-[0.75] text-fg/[0.06]"
          aria-hidden
        >
          veira
        </p>
      <div className="flex flex-col items-center justify-center gap-2 pb-6 text-xs text-fg/30 sm:flex-row sm:gap-4">
        <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        <span className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-fg/60">{t("footer.linkPrivacy")}</Link>
          <Link href="/terms" className="hover:text-fg/60">{t("footer.linkTerms")}</Link>
        </span>
      </div>
    </footer>
  );
}
