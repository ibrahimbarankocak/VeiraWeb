"use client";

import { useEffect, useState, type FormEvent } from "react";
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

/** Turns a display name into a valid starting point for a username (letters/numbers/underscore only). */
function slugifyUsername(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  return (base || "runner").slice(0, 15);
}

function errText(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") {
    return (e as { message: string }).message;
  }
  return String(e);
}

const fieldLabel = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-fg/45";
const fieldInput =
  "h-11 w-full rounded-xl border border-fg/10 bg-fg/[0.04] px-3.5 text-sm outline-none transition focus:border-mint-bright";

function EditProfileCard({
  user,
  profile,
  onSaved,
}: {
  user: NonNullable<ReturnType<typeof useUser>["user"]>;
  profile: Profile | null;
  onSaved: (p: Partial<Profile>) => void;
}) {
  const { t } = useI18n();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [name, setName] = useState(displayName(user));
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  async function saveUsername(e: FormEvent) {
    e.preventDefault();
    const value = username.trim().replace(/^@/, "");
    if (value.length < 3 || value.length > 20 || !/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameMsg({ ok: false, text: t("profile.usernameInvalid") });
      return;
    }
    setSavingUsername(true);
    setUsernameMsg(null);
    try {
      const { error } = await getSupabase().from("profiles").update({ username: value }).eq("id", user.id);
      if (error) throw error;
      onSaved({ username: value });
      setUsernameMsg({ ok: true, text: t("profile.usernameSaved") });
    } catch (err) {
      const msg = errText(err);
      setUsernameMsg({ ok: false, text: /duplicate|unique/i.test(msg) ? t("profile.usernameTaken") : msg });
    } finally {
      setSavingUsername(false);
    }
  }

  async function saveName(e: FormEvent) {
    e.preventDefault();
    const value = name.trim();
    if (!value) {
      setNameMsg({ ok: false, text: t("profile.nameRequired") });
      return;
    }
    setSavingName(true);
    setNameMsg(null);
    try {
      const { error } = await getSupabase().auth.updateUser({ data: { full_name: value } });
      if (error) throw error;
      setNameMsg({ ok: true, text: t("profile.nameSaved") });
    } catch (err) {
      setNameMsg({ ok: false, text: errText(err) });
    } finally {
      setSavingName(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-fg/10 bg-panel/70 p-6">
      <h2 className="headline text-2xl">{t("profile.editProfile")}</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <form onSubmit={saveName} className="space-y-2">
          <label className={fieldLabel} htmlFor="displayName">{t("profile.nameLabel")}</label>
          <input
            id="displayName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldInput}
          />
          {nameMsg && <p className={`text-xs ${nameMsg.ok ? "text-mint-bright" : "text-red-400"}`}>{nameMsg.text}</p>}
          <button
            type="submit"
            disabled={savingName}
            className="rounded-full bg-fg/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-wide text-fg/80 transition hover:bg-fg/10 disabled:opacity-50"
          >
            {savingName ? t("profile.saving") : t("profile.save")}
          </button>
        </form>

        <form onSubmit={saveUsername} className="space-y-2">
          <label className={fieldLabel} htmlFor="username">{t("profile.usernameLabel")}</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-fg/40">@</span>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`${fieldInput} pl-7`}
              maxLength={20}
            />
          </div>
          <p className="text-xs text-fg/40">{t("profile.usernameHint")}</p>
          {usernameMsg && (
            <p className={`text-xs ${usernameMsg.ok ? "text-mint-bright" : "text-red-400"}`}>{usernameMsg.text}</p>
          )}
          <button
            type="submit"
            disabled={savingUsername}
            className="rounded-full bg-fg/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-wide text-fg/80 transition hover:bg-fg/10 disabled:opacity-50"
          >
            {savingUsername ? t("profile.saving") : t("profile.save")}
          </button>
        </form>
      </div>
    </div>
  );
}

function PasswordCard({ canChange }: { canChange: boolean }) {
  const { t } = useI18n();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pw.length < 6) return setMsg({ ok: false, text: t("profile.passwordTooShort") });
    if (pw !== confirm) return setMsg({ ok: false, text: t("profile.passwordMismatch") });
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await getSupabase().auth.updateUser({ password: pw });
      if (error) throw error;
      setMsg({ ok: true, text: t("profile.passwordUpdated") });
      setPw("");
      setConfirm("");
    } catch (err) {
      setMsg({ ok: false, text: errText(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-fg/10 bg-panel/70 p-6">
      <h2 className="headline text-2xl">{t("profile.passwordSection")}</h2>
      {!canChange ? (
        <p className="mt-3 text-sm text-fg/50">{t("profile.googlePasswordNote")}</p>
      ) : (
        <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className={fieldLabel} htmlFor="newPw">{t("profile.newPassword")}</label>
            <input
              id="newPw"
              type="password"
              minLength={6}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className={fieldInput}
            />
          </div>
          <div className="space-y-2">
            <label className={fieldLabel} htmlFor="confirmPw">{t("profile.confirmPassword")}</label>
            <input
              id="confirmPw"
              type="password"
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={fieldInput}
            />
          </div>
          <div className="sm:col-span-2">
            {msg && <p className={`mb-2 text-xs ${msg.ok ? "text-mint-bright" : "text-red-400"}`}>{msg.text}</p>}
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-fg/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-wide text-fg/80 transition hover:bg-fg/10 disabled:opacity-50"
            >
              {busy ? t("profile.saving") : t("profile.updatePassword")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

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

  // Google (and any other) sign-ups never get a username from the auth provider — give everyone
  // a placeholder handle on first visit so "@username" isn't blank, and it's editable below.
  useEffect(() => {
    if (!user || !profileLoaded || profile?.username) return;
    let alive = true;
    const base = slugifyUsername(displayName(user));
    (async () => {
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = attempt === 0 ? base : `${base}${Math.floor(1000 + Math.random() * 9000)}`;
        const { error } = await getSupabase().from("profiles").update({ username: candidate }).eq("id", user.id);
        if (!error) {
          if (alive) setProfile((p) => (p ? { ...p, username: candidate } : p));
          return;
        }
        if (!/duplicate|unique/i.test(error.message)) return;
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, profileLoaded, profile?.username]);

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

              <EditProfileCard user={user} profile={profile} onSaved={(p) => setProfile((cur) => (cur ? { ...cur, ...p } : cur))} />
              <PasswordCard canChange={provider !== "google"} />

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
