import type { Metadata } from "next";
import { Dancing_Script } from "next/font/google";
import { Apology } from "./Apology";

const script = Dancing_Script({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Seda ❤️",
  description: "Sana söylemek istediğim bir şey var.",
  robots: { index: false, follow: false },
};

export default function SedaPage() {
  return (
    <div className={script.variable}>
      <Apology />
    </div>
  );
}
