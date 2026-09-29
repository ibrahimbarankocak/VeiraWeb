"use client";

import { useI18n } from "../../lib/i18n/context";

export function Marquee({ reverse = false }: { reverse?: boolean }) {
  const { t } = useI18n();
  const items = [
    t("marquee.item1"),
    t("marquee.item2"),
    t("marquee.item3"),
    t("marquee.item4"),
    t("marquee.item5"),
    t("marquee.item6"),
  ];
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-fg/10 bg-ink py-4">
      <div className={`flex w-max animate-marquee gap-10 whitespace-nowrap ${reverse ? "[animation-direction:reverse]" : ""}`}>
        {[...row, ...row].map((label, i) => (
          <span key={i} className="headline flex items-center gap-10 text-2xl text-fg/50">
            {label}
            <span className="text-mint-bright">⚡</span>
          </span>
        ))}
      </div>
    </div>
  );
}
