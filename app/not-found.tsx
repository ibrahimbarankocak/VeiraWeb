import Link from "next/link";
import { Navbar } from "../components/sections/Navbar";
import { Footer } from "../components/sections/Footer";
import { Bolt } from "../components/ui/Brand";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-5 text-center md:px-8">
        <div className="blob left-1/2 top-1/3 h-[26rem] w-[26rem] -translate-x-1/2 bg-mint-bright/20" />
        <div className="relative">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-mint text-mint-light">
            <Bolt className="h-7 w-7" />
          </span>
          <h1 className="headline mt-6 text-[clamp(4rem,14vw,9rem)] leading-none">404</h1>
          <p className="mt-4 text-lg text-fg/60">Bu sayfa koşuya çıkmış, geri dönmedi.</p>
          <Link href="/" className="btn-mint mt-8 inline-flex">
            Ana sayfaya dön
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
