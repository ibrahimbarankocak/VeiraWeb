"use client";

import { Navbar } from "../sections/Navbar";
import { Footer } from "../sections/Footer";
import { useI18n } from "../../lib/i18n/context";

type Section = { h: string; p: string[] };
type LangContent = { heading: string; updated: string; sections: Section[] };

export function LegalPage({ content }: { content: Record<"tr" | "en" | "es", LangContent> }) {
  const { lang } = useI18n();
  const c = content[lang];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="relative overflow-hidden px-5 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="blob -left-40 top-0 h-[28rem] w-[28rem] bg-mint-bright/20" />
        <div className="relative mx-auto max-w-2xl">
          <p className="eyebrow mb-3">{c.updated}</p>
          <h1 className="headline text-[clamp(2.6rem,7vw,4.5rem)]">{c.heading}</h1>

          <div className="mt-10 space-y-8">
            {c.sections.map((s) => (
              <div key={s.h}>
                <h2 className="font-display text-xl font-bold uppercase tracking-wide text-mint-bright">{s.h}</h2>
                <div className="mt-2 space-y-3 text-sm leading-relaxed text-fg/65">
                  {s.p.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
