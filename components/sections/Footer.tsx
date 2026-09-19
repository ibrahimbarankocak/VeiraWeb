import Link from "next/link";
import { Reveal } from "../ui/Reveal";
import { Logo } from "../ui/Brand";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden px-5 py-32 text-center md:px-8">
      <div className="blob left-1/2 top-0 h-[30rem] w-[40rem] -translate-x-1/2 bg-mint-bright/30" />
      <Reveal>
        <h2 className="headline mx-auto max-w-4xl text-[clamp(3.4rem,9vw,8rem)]">
          Your season,
          <br />
          <span className="grad-text">running itself.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-white/60">Races, shoes, league and clubs — sorted. Just go run.</p>
        <Link href="/login?mode=signup" className="btn-mint mt-10">
          Join Veira free
        </Link>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-white/10 px-5 pt-14 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-white/50">Track your races, manage your shoes, climb the league.</p>
        </div>
        <nav className="space-y-2 text-sm text-white/60">
          <p className="mb-3 font-display text-lg font-bold uppercase tracking-wide text-white">Product</p>
          <a href="#features" className="block hover:text-white">Features</a>
          <a href="#calendar" className="block hover:text-white">Race calendar</a>
          <a href="#pricing" className="block hover:text-white">Plans</a>
        </nav>
        <nav className="space-y-2 text-sm text-white/60">
          <p className="mb-3 font-display text-lg font-bold uppercase tracking-wide text-white">Account</p>
          <Link href="/login" className="block hover:text-white">Log in</Link>
          <Link href="/login?mode=signup" className="block hover:text-white">Sign up</Link>
          <a href="#faq" className="block hover:text-white">FAQ</a>
        </nav>
      </div>
      <p className="headline select-none pt-10 text-center text-[clamp(8rem,32vw,30rem)] lowercase leading-[0.75] text-white/[0.06]" aria-hidden>
        veira
      </p>
      <p className="pb-6 text-center text-xs text-white/30">© {new Date().getFullYear()} Veira</p>
    </footer>
  );
}
