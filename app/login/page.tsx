"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "../../components/ui/Brand";
import { getSupabase } from "../../lib/supabase";
import { useUser } from "../../lib/useUser";

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("error sending"))
    return "We could not send the confirmation email right now. Please try again in a few minutes, or contact support.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a few minutes and try again.";
  if (m.includes("invalid login credentials")) return "Wrong email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email first — check your inbox.";
  if (m.includes("already registered")) return "This email already has an account. Try logging in.";
  return message;
}

const input =
  "h-14 w-full rounded-md border border-mint/25 bg-white px-4 text-base text-onmint outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20";
const label = "mb-2 block px-1 text-sm font-semibold text-mint";

function AuthForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

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
        setMsg({ ok: true, text: "Almost there! Check your inbox and confirm your email to finish signing up." });
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
    if (!email) return setMsg({ ok: false, text: "Enter your email first." });
    const { error } = await getSupabase().auth.resetPasswordForEmail(email);
    setMsg(error ? { ok: false, text: friendlyError(error.message) } : { ok: true, text: "Password reset email sent." });
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
        {signup ? "Ready to join the league?" : "Welcome back, runner"}
      </p>
      <h1 className="headline mt-3 text-[clamp(3.2rem,9vw,7rem)] text-mint">
        {signup ? "Create your account" : "Log in to veira"}
      </h1>

      <form
        onSubmit={onSubmit}
        className="mt-12 rounded-md border border-mint bg-white p-6 text-left shadow-[0_30px_80px_-40px_rgba(40,104,72,0.5)] sm:p-12"
      >
        <div className="space-y-6">
          {signup && (
            <div>
              <label className={label} htmlFor="name">First name*</label>
              <input id="name" name="name" required autoComplete="given-name" className={input} />
            </div>
          )}
          <div>
            <label className={label} htmlFor="email">Email*</label>
            <input id="email" name="email" type="email" required autoComplete="email" className={input} />
          </div>
          <div>
            <label className={label} htmlFor="password">Password*</label>
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
            I agree to the terms and privacy policy.
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
            {busy ? "Please wait…" : signup ? "Sign up" : "Log in"}
          </button>
          <button
            type="button"
            onClick={google}
            className="rounded-md border border-mint/40 px-6 py-[0.95rem] text-sm font-bold text-mint transition hover:bg-mint/5"
          >
            Continue with Google
          </button>
          {!signup && (
            <button
              type="button"
              onClick={(e) => forgot(e.currentTarget.closest("form"))}
              className="text-sm font-semibold text-neutral-500 underline-offset-4 hover:underline"
            >
              Forgot password?
            </button>
          )}
        </div>
      </form>

      <p className="mt-8 text-sm text-neutral-600">
        {signup ? "Already have an account?" : "New to veira?"}{" "}
        <button
          onClick={() => {
            setMode(signup ? "login" : "signup");
            setMsg(null);
          }}
          className="font-bold text-mint underline-offset-4 hover:underline"
        >
          {signup ? "Log in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}

export default function LoginPage() {
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
        <Link href="/" className="text-sm font-semibold text-mint hover:underline">← Back to site</Link>
      </div>
      <div className="flex min-h-[80vh] items-center py-12">
        <Suspense>
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
}
