import Link from "next/link";
import { Logo } from "../ui/Brand";

const links = [
  { href: "#features", label: "Features" },
  { href: "#calendar", label: "Race calendar" },
  { href: "#pricing", label: "Plans" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-ink/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-semibold text-white/60 transition hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-semibold text-white/70 hover:text-white sm:block">
            Log in
          </Link>
          <Link
            href="/login?mode=signup"
            className="rounded-full bg-gradient-to-r from-mint-bright to-[#b6ff5c] px-5 py-2 font-display text-base font-bold uppercase tracking-wide text-ink"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
