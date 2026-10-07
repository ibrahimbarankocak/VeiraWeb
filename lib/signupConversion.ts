import { trackSignupConversion } from "./gtag";

const FIRED_PREFIX = "veira_signup_conv_fired_";
const PENDING_KEY = "veira_pending_signup_email";
// Generous enough to cover an OAuth consent round-trip or an immediate-session signup redirect,
// while staying far shorter than any realistic gap between a real account's creation and a later login.
const NEW_ACCOUNT_WINDOW_MS = 10 * 60 * 1000;

function alreadyFired(userId: string): boolean {
  try {
    return localStorage.getItem(FIRED_PREFIX + userId) === "1";
  } catch {
    return false;
  }
}

function markFired(userId: string) {
  try {
    localStorage.setItem(FIRED_PREFIX + userId, "1");
  } catch {
    // ignore (private mode / storage disabled)
  }
}

/**
 * Call when an email/password signup form is submitted, before we know whether Supabase will require
 * email confirmation. If confirmation is required, the account only truly exists once the user clicks
 * the email link and comes back signed in — which can happen minutes or hours later, on the same
 * browser — so we can't rely on a short "just created" time window for that path.
 */
export function markSignupPending(email: string) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ email: email.toLowerCase(), ts: Date.now() }));
  } catch {
    // ignore
  }
}

function consumePendingSignup(email: string | undefined): boolean {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw || !email) return false;
    const pending = JSON.parse(raw) as { email: string; ts: number };
    if (pending.email !== email.toLowerCase()) return false;
    localStorage.removeItem(PENDING_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fires the Google Ads signup conversion exactly once per account, only once a registration has
 * genuinely completed. Covers every entry point: email/password signup with confirmation disabled
 * (session comes back immediately), email/password signup that required clicking a confirmation link
 * (matched via the pending marker set at submit time), and a Google sign-in that created a brand new
 * account (its `created_at` is "now" — a *returning* Google login has an old `created_at`, so it's
 * correctly left alone).
 */
export function maybeTrackSignupConversion(user: { id: string; email?: string | null; created_at: string }) {
  if (alreadyFired(user.id)) return;

  const pendingConfirmed = consumePendingSignup(user.email ?? undefined);
  const createdAt = new Date(user.created_at).getTime();
  const recentlyCreated = Number.isFinite(createdAt) && Date.now() - createdAt < NEW_ACCOUNT_WINDOW_MS;

  if (pendingConfirmed || recentlyCreated) {
    markFired(user.id);
    trackSignupConversion();
  }
}
