import type { ReactNode } from "react";
import { Bolt } from "./Brand";

export type Tab = "Home" | "Races" | "League" | "Inventory" | "Clubs";

const tabIcons: Record<Tab, string> = {
  Home: "M3 11 12 3l9 8v10h-6v-6H9v6H3V11Z",
  Races: "M6 3v18M6 4h11l-2 4 2 4H6",
  League: "M8 4h8v5a4 4 0 0 1-8 0V4ZM6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M12 13v4M8 21h8",
  Inventory: "M4 5h16v5H4zM4 14h16v5H4zM9 7.5h6M9 16.5h6",
  Clubs: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a6 6 0 0 1 12 0M17 11a3 3 0 1 0 0-5M21 20a5 5 0 0 0-4-5",
};

export function PhoneFrame({
  active,
  children,
  tint = "rgba(40,104,72,0.35)",
  className = "",
}: {
  active: Tab;
  children: ReactNode;
  tint?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto aspect-[9/19] w-full max-w-[340px] rounded-[3rem] text-white border border-white/15 bg-[#0d0f0e] p-[9px] shadow-[0_40px_120px_-20px_rgba(61,220,151,0.25)] ${className}`}
    >
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[2.5rem] bg-[#07110d]"
        style={{ backgroundImage: `radial-gradient(120% 60% at 50% 0%, ${tint}, transparent 70%)` }}
      >
        <div className="absolute left-1/2 top-2.5 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
        <div className="flex items-center justify-between px-5 pb-2 pt-11">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-mint text-mint-light">
              <Bolt className="h-3.5 w-3.5" />
            </span>
            <span className="font-display text-2xl font-bold lowercase leading-none">veira</span>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-mint text-[10px] font-bold text-mint-light">
            BA
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-4">{children}</div>

        <nav className="m-3 mt-2 flex justify-between rounded-full border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur">
          {(Object.keys(tabIcons) as Tab[]).map((t) => (
            <div
              key={t}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[9px] font-semibold ${
                t === active
                  ? "bg-mint/50 text-mint-light shadow-[0_0_18px_rgba(61,220,151,0.35)]"
                  : "text-white/40"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d={tabIcons[t]} />
              </svg>
              {t}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
