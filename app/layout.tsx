import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import Script from "next/script";
import { type ReactNode } from "react";
import { ScrollProgress } from "../components/ui/ScrollProgress";
import { SignupConversionTracker } from "../components/ui/SignupConversionTracker";
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

const description =
  "Yarış takvimi, ayakkabı takibi ve haftalık lig tek uygulamada — 5K'dan ultraya, Türkiye ve ötesindeki koşucular için.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.appveira.com"),
  other: { "darkreader-lock": "" },
  title: { default: "Veira — Koşu arkadaşın", template: "%s" },
  description,
  openGraph: {
    title: "Veira — Koşu arkadaşın",
    description,
    url: "https://www.appveira.com",
    siteName: "Veira",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veira — Koşu arkadaşın",
    description,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="tr"
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
        {/* Google tag (gtag.js) — Google Ads AW-18489992499 */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-18489992499" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18489992499');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>
          <SmoothScroll />
          <ScrollProgress />
          <SignupConversionTracker />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
