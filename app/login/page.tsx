"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "../../components/ui/Brand";
import { getSupabase } from "../../lib/supabase";
import { useUser } from "../../lib/useUser";
import { useI18n } from "../../lib/i18n/context";

const input =
  "h-14 w-full rounded-md border border-mint/25 bg-white px-4 text-base text-onmint outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20";
const label = "mb-2 block px-1 text-sm font-semibold text-mint";

function AuthForm() {
  const { t } = useI18n();
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

  function friendlyError(message: string): string {
    const m = message.toLowerCase();
    if (m.includes("error sending")) return t("login.errorSending");
    if (m.includes("rate limit")) return t("login.rateLimit");
    if (m.includes("invalid login credentials")) return t("login.invalidCredentials");
    if (m.includes("email not confirmed")) return t("login.emailNotConfirmed");
    if (m.includes("already registered")) return t("login.alreadyRegistered");
    return message;
  }

  // Already signed in (or just returned from Google) → main page.
  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const signup = mode === "signup";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    setBusy(true);
    setMsg(null);
    try {
      const sb = getSupabase();
      if (signup) {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: { data: { full_name: String(f.get("name")) }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          router.replace("/");
          return;
        }
        // Supabase returns a user with no identities when the email is already registered.
        if (data.user && data.user.identities?.length === 0) throw new Error("already registered");
        setMsg({ ok: true, text: t("login.almostThere") });
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/");
        return;
      }
    } catch (err) {
      setMsg({ ok: false, text: friendlyError(err instanceof Error ? err.message : "Something went wrong.") });
    } finally {
      setBusy(false);
    }
  }

  async function forgot(form: HTMLFormElement | null) {
    const email = form ? String(new FormData(form).get("email") || "") : "";
    if (!email) return setMsg({ ok: false, text: t("login.enterEmailFirst") });
    const { error } = await getSupabase().auth.resetPasswordForEmail(email);
    setMsg(error ? { ok: false, text: friendlyError(error.message) } : { ok: true, text: t("login.passwordResetSent") });
  }

  async function google() {
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setMsg({ ok: false, text: friendlyError(error.message) });
  }

  return (
    <div className="mx-auto w-full max-w-3xl text-center">
      <p className="font-display text-xl font-bold uppercase tracking-wide text-mint">
        {signup ? t("login.readyToJoin") : t("login.welcomeBack")}
      </p>
      <h1 className="headline mt-3 text-[clamp(3.2rem,9vw,7rem)] text-mint">
        {signup ? t("login.createAccount") : t("login.logInTitle")}
      </h1>

      <form
        onSubmit={onSubmit}
        className="mt-12 rounded-md border border-mint bg-white p-6 text-left shadow-[0_30px_80px_-40px_rgba(40,104,72,0.5)] sm:p-12"
      >
        <div className="space-y-6">
          {signup && (
            <div>
              <label className={label} htmlFor="name">{t("login.firstName")}</label>
              <input id="name" name="name" required autoComplete="given-name" className={input} />
            </div>
          )}
          <div>
            <label className={label} htmlFor="email">{t("login.email")}</label>
            <input id="email" name="email" type="email" required autoComplete="email" className={input} />
          </div>
          <div>
            <label className={label} htmlFor="password">{t("login.password")}</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={signup ? "new-password" : "current-password"}
              className={input}
            />
          </div>
        </div>

        {signup && (
          <label className="mt-6 flex items-start gap-3 text-sm font-medium text-mint">
            <input type="checkbox" required className="mt-0.5 h-5 w-5 accent-[#286848]" />
            <span>
              {t("login.agreePrefix")}{" "}
              <Link href="/terms" target="_blank" className="underline underline-offset-2 hover:text-[#1e5238]">
                {t("login.termsLink")}
              </Link>{" "}
              {t("login.agreeMiddle")}{" "}
              <Link href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-[#1e5238]">
                {t("login.privacyLink")}
              </Link>
              {t("login.agreeSuffix")}
            </span>
          </label>
        )}

        {msg && (
          <p role="status" className={`mt-6 text-sm font-semibold ${msg.ok ? "text-mint" : "text-red-600"}`}>
            {msg.text}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            disabled={busy}
            className="rounded-md bg-mint px-9 py-4 font-display text-xl font-bold uppercase tracking-wide text-mint-light transition hover:bg-[#1e5238] disabled:opacity-60"
          >
            {busy ? t("login.pleaseWait") : signup ? t("login.signUp") : t("login.logIn")}
          </button>
          <button
            type="button"
            onClick={google}
            className="rounded-md border border-mint/40 px-6 py-[0.95rem] text-sm font-bold text-mint transition hover:bg-mint/5"
          >
            {t("login.continueGoogle")}
          </button>
          {!signup && (
            <button
              type="button"
              onClick={(e) => forgot(e.currentTarget.closest("form"))}
              className="text-sm font-semibold text-neutral-500 underline-offset-4 hover:underline"
            >
              {t("login.forgotPassword")}
            </button>
          )}
        </div>
      </form>

      <p className="mt-8 text-sm text-neutral-600">
        {signup ? t("login.alreadyHaveAccount") : t("login.newToVeira")}{" "}
        <button
          onClick={() => {
            setMode(signup ? "login" : "signup");
            setMsg(null);
          }}
          className="font-bold text-mint underline-offset-4 hover:underline"
        >
          {signup ? t("login.logIn") : t("login.createAnAccount")}
        </button>
      </p>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useI18n();
  return (
    <main
      className="relative min-h-screen bg-white px-5 py-8 text-onmint"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(40,104,72,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(40,104,72,0.09) 1px, transparent 1px)",
        backgroundSize: "100px 100px",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Logo dark />
        <Link href="/" className="text-sm font-semibold text-mint hover:underline">{t("login.backToSite")}</Link>
      </div>
      <div className="flex min-h-[80vh] items-center py-12">
        <Suspense>
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
}
