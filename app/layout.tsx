import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import { type ReactNode } from "react";
import { ScrollProgress } from "../components/ui/ScrollProgress";
import { SmoothScroll } from "../components/scenes/SmoothScroll";
import { LanguageProvider } from "../lib/i18n/context";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  other: { "darkreader-lock": "" },
  title: "Veira — The running companion",
  description:
    "Race calendar, shoe tracking and a weekly league in one app, for runners from 5K to ultra — in Turkey and beyond.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply the saved theme before first paint so there is no dark-to-light flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("veira-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>
          <SmoothScroll />
          <ScrollProgress />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
