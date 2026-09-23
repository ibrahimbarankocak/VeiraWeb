import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import { type ReactNode } from "react";
import { ScrollProgress } from "../components/ui/ScrollProgress";
import { SmoothScroll } from "../components/scenes/SmoothScroll";
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
    "Discover races, track your shoes, and climb the weekly league. Veira is the running companion for runners from 5K to ultra.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <SmoothScroll />
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
