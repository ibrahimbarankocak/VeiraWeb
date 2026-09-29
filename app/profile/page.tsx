"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/sections/Navbar";
import { Footer } from "../../components/sections/Footer";
import { getSupabase } from "../../lib/supabase";
import { displayName, initials, useUser } from "../../lib/useUser";
import { useI18n } from "../../lib/i18n/context";

type Profile = {
  username: string | null;
  avatar_url: string | null;
  role: string | null;
  total_km: number | null;
  shoe_count: number | null;
  created_at: string | null;
};

export default function ProfilePage() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { user, loading } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const fmtDate = (iso?: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString(lang === "tr" ? "tr-TR" : lang === "es" ? "es-ES" : "en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    getSupabase()
      .from("profiles")
      .select("username,avatar_url,role,total_km,shoe_count,created_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        setProfile((data as Profile | null) ?? null);
        setProfileLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  async function signOut() {
    setSigningOut(true);
    await getSupabase().auth.signOut();
    router.replace("/");
  }

  const name = user ? displayName(user) : "";
  const avatar = profile?.avatar_url || (user?.user_metadata?.avatar_url as string | undefined);
  const provider = (user?.app_metadata?.provider as string | undefined) ?? "email";
  const role = profile?.role && profile.role !== "user" ? profile.role : null;
  const locale = lang === "tr" ? "tr-TR" : lang === "es" ? "es-ES" : "en-US";

  const stats = [
    [t("profile.totalKm"), profile ? Number(profile.total_km ?? 0).toLocaleString(locale, { maximumFractionDigits: 1 }) : "—"],
    [t("profile.shoes"), profile ? String(profile.shoe_count ?? 0) : "—"],
    [t("profile.memberSince"), fmtDate(profile?.created_at ?? user?.created_at)],
  ];

  const accountRows = [
    [t("profile.emailLabel"), user?.email ?? "—"],
    [t("profile.signInMethod"), provider === "google" ? t("profile.signInGoogle") : t("profile.signInEmail")],
    [t("profile.emailStatus"), user?.email_confirmed_at ? t("profile.confirmed") : t("profile.notConfirmed")],
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="relative overflow-hidden px-5 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="blob -left-40 top-0 h-[28rem] w-[28rem] bg-mint-bright/25" />
        <div className="relative mx-auto max-w-3xl">
          {!user ? (
            <p className="py-24 text-center text-fg/50">{t("profile.loading")}</p>
          ) : (
            <>
              <p className="eyebrow mb-3">{t("profile.eyebrow")}</p>
              <div className="flex flex-wrap items-center gap-5">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" referrerPolicy="no-referrer" className="h-24 w-24 rounded-full object-cover ring-2 ring-mint-bright/40" />
                ) : (
                  <span className="grid h-24 w-24 place-items-center rounded-full bg-mint font-display text-4xl font-bold text-mint-light ring-2 ring-mint-bright/40">
                    {initials(name)}
                  </span>
                )}
                <div className="min-w-0">
                  <h1 className="headline break-words text-[clamp(2.6rem,7vw,5rem)]">{name}</h1>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-fg/55">
                    {profile?.username ? <span>@{profile.username}</span> : null}
                    {role && (
                      <span className="rounded-full bg-mint-bright/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-mint-bright">
                        {role}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <dl className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-fg/10 bg-fg/10 sm:grid-cols-3">
                {stats.map(([k, v]) => (
                  <div key={k} className="bg-panel px-5 py-6">
                    <dd className="headline text-3xl text-mint-bright">{profileLoaded || k === t("profile.memberSince") ? v : "…"}</dd>
                    <dt className="mt-1 text-xs font-semibold uppercase tracking-widest text-fg/45">{k}</dt>
                  </div>
                ))}
              </dl>

              <div className="mt-6 rounded-2xl border border-fg/10 bg-panel/70 p-6">
                <h2 className="headline text-2xl">{t("profile.account")}</h2>
                <dl className="mt-4 divide-y divide-fg/10 text-sm">
                  {accountRows.map(([k, v]) => (
                    <div key={k} className="flex flex-wrap justify-between gap-2 py-3">
                      <dt className="text-fg/50">{k}</dt>
                      <dd className="font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={signOut}
                  disabled={signingOut}
                  className="rounded-full border border-fg/20 px-7 py-3.5 font-display text-lg font-bold uppercase tracking-wide transition hover:border-red-400 hover:text-red-300 disabled:opacity-60"
                >
                  {signingOut ? t("profile.signingOut") : t("profile.signOut")}
                </button>
              </div>
              <p className="mt-6 text-xs text-fg/35">{t("profile.footnote")}</p>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
