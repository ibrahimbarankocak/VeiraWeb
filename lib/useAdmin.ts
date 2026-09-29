"use client";

import { useEffect, useState } from "react";
import { useUser } from "./useUser";
import { getSupabase } from "./supabase";

// Mirrors the mobile app's admin_guard.dart: profiles.role === 'admin', with this email as a
// safety net if the profiles row doesn't exist yet.
const ADMIN_EMAILS = new Set(["baran1299kocak@gmail.com"]);

export function useIsAdmin(): { isAdmin: boolean; ready: boolean } {
  const { user, loading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsAdmin(false);
      setChecked(true);
      return;
    }
    const email = user.email?.trim().toLowerCase();
    if (email && ADMIN_EMAILS.has(email)) {
      setIsAdmin(true);
      setChecked(true);
      return;
    }
    let alive = true;
    getSupabase()
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        setIsAdmin(data?.role === "admin");
        setChecked(true);
      });
    return () => {
      alive = false;
    };
  }, [user, loading]);

  return { isAdmin, ready: checked && !loading };
}
