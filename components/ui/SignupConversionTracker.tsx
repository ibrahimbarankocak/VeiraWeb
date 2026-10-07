"use client";

import { useEffect } from "react";
import { useUser } from "../../lib/useUser";
import { maybeTrackSignupConversion } from "../../lib/signupConversion";

/**
 * Mounted once, globally — OAuth and email-confirmation redirects both land the user back on an
 * arbitrary page (usually `/`, not necessarily `/login`), so the completed-signup check has to live
 * somewhere that's always present rather than on the login page itself.
 */
export function SignupConversionTracker() {
  const { user } = useUser();

  useEffect(() => {
    if (user) maybeTrackSignupConversion(user);
  }, [user]);

  return null;
}
