"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "../ui/Brand";
import { ThemeToggle } from "../ui/ThemeToggle";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { useI18n } from "../../lib/i18n/context";
import { displayName, initials, useUser } from "../../lib/useUser";
import { useIsAdmin } from "../../lib/useAdmin";

export function Navbar() {
  const { t } = useI18n();
  const { user, loading } = useUser();
  const { isAdmin } = useIsAdmin();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/#features", label: t("nav.features") },
    { href: "/#plan", label: t("nav.plan") },
    { href: "/races", label: t("nav.races") },
    { href: "/#pricing", label: t("nav.pricing") },
    { href: "/#faq", label: t("nav.faq") },
  ];

  // Hide on scroll down, reveal on scroll up. Always shown near the top of the page.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.max(window.scrollY, 0);
        const delta = y - last;
        if (y < 80) setHidden(false);
        else if (delta > 6) setHidden(true);
        else if (delta < -6) setHidden(false);
        if (Math.abs(delta) > 6 || y < 80) last = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Let other sticky UI (e.g. the race filter bar) follow the header.
  useEffect(() => {
    document.documentElement.dataset.nav = hidden && !open ? "hidden" : "shown";
  }, [hidden, open]);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const name = user ? displayName(user) : "";
  const avatar = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-fg/5 bg-ink/60 backdrop-blur-xl transition-transform duration-300 ease-out ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap text-sm font-semibold text-fg/60 transition hover:text-fg">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher className="hidden sm:grid" />
          <ThemeToggle />
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden rounded-full border border-mint-bright/30 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-mint-bright transition hover:bg-mint-bright/10 sm:block"
            >
              Admin
            </Link>
          )}
          {loading ? (
            <span className="h-9 w-24" aria-hidden />
          ) : user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2.5 rounded-full border border-fg/10 bg-fg/[0.04] py-1 pl-1 pr-4 text-sm font-semibold transition hover:border-mint-bright/50"
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-mint text-[11px] font-bold text-mint-light">
                  {initials(name)}
                </span>
              )}
              <span className="hidden max-w-[8rem] truncate sm:block">{t("nav.myProfile")}</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm font-semibold text-fg/70 hover:text-fg sm:block">
                {t("nav.login")}
              </Link>
              <Link
                href="/login?mode=signup"
                className="whitespace-nowrap rounded-full bg-gradient-to-r from-[#3ddc97] to-[#b6ff5c] px-5 py-2 font-display text-base font-bold uppercase tracking-wide text-onmint"
              >
                {t("nav.getStarted")}
              </Link>
            </>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-full border border-fg/10 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
    </header>

      {open && (
        <nav
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-fg/10 bg-ink/95 px-5 py-8 backdrop-blur-2xl lg:hidden"
          aria-label="Mobile"
          data-lenis-prevent
        >
          <div className="mb-6 flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="headline block border-b border-fg/10 py-4 text-4xl"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {!loading && !user && (
              <li>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="headline block border-b border-fg/10 py-4 text-4xl text-mint-bright"
                >
                  {t("nav.login")}
                </Link>
              </li>
            )}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="headline block border-b border-fg/10 py-4 text-4xl text-mint-bright"
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </>
  );
}
