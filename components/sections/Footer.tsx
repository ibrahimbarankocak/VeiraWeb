import Link from "next/link";
import { Reveal } from "../ui/Reveal";
import { Logo } from "../ui/Brand";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden px-5 py-32 text-center md:px-8">
      <div className="blob left-[calc(50%-20rem)] top-0 h-[30rem] w-[40rem] bg-mint-bright/30" />
      <Reveal>
        <h2 className="headline mx-auto max-w-4xl text-[clamp(3.4rem,9vw,8rem)]">
          Your season,
          <br />
          <span className="grad-text">running itself.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-fg/60">Races, shoes, league and clubs — sorted. Just go run.</p>
        <Link href="/login?mode=signup" className="btn-mint mt-10">
          Join Veira free
        </Link>
      </Reveal>
    </section>
  );
}

const colTitle = "mb-3 font-display text-lg font-bold uppercase tracking-wide text-fg";
const colLink = "block py-0.5 hover:text-fg";

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-fg/10 px-5 pt-14 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
        <div className="flex flex-col items-center lg:items-start">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-fg/50">Track your races, manage your shoes, climb the league.</p>
        </div>

        <div className="grid w-full max-w-md grid-cols-2 justify-items-center gap-8 lg:w-auto lg:max-w-none lg:justify-items-start lg:gap-24">
          <nav className="text-sm text-fg/60" aria-label="Product">
            <p className={colTitle}>Product</p>
            <Link href="/#features" className={colLink}>Features</Link>
            <Link href="/races" className={colLink}>Race calendar</Link>
            <Link href="/#pricing" className={colLink}>Plans</Link>
          </nav>
          <nav className="text-sm text-fg/60" aria-label="Account">
            <p className={colTitle}>Account</p>
            <Link href="/login" className={colLink}>Log in</Link>
            <Link href="/login?mode=signup" className={colLink}>Sign up</Link>
            <Link href="/profile" className={colLink}>My profile</Link>
            <Link href="/#faq" className={colLink}>FAQ</Link>
          </nav>
        </div>
      </div>

        <p
          className="headline select-none pt-10 text-center text-[clamp(8rem,32vw,30rem)] lowercase leading-[0.75] text-fg/[0.06]"
          aria-hidden
        >
          veira
        </p>
      <p className="pb-6 text-center text-xs text-fg/30">© {new Date().getFullYear()} Veira</p>
    </footer>
  );
}
