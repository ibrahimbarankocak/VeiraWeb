import { getSupabase } from "./supabase";

/**
 * Mirrors the mobile app's RacePlanService (lib/services/race_plan_service.dart):
 * `pinned_races(user_id, race_id, importance?)`. The `importance` column may not exist yet on
 * older databases — insert falls back to omitting it rather than failing outright.
 */

function isMissingColumn(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e);
  return m.includes("42703") || m.includes("PGRST204") || m.includes("importance");
}

export async function isRacePinned(raceId: string): Promise<boolean> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return false;
  const { data, error } = await sb
    .from("pinned_races")
    .select("race_id")
    .eq("user_id", auth.user.id)
    .eq("race_id", raceId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function pinRace(raceId: string): Promise<void> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("not-signed-in");
  const userId = auth.user.id;
  try {
    const { error } = await sb.from("pinned_races").insert({ user_id: userId, race_id: raceId, importance: "b" });
    if (error) throw error;
  } catch (e) {
    if (!isMissingColumn(e)) throw e;
    const { error } = await sb.from("pinned_races").insert({ user_id: userId, race_id: raceId });
    if (error) throw error;
  }
}

export async function unpinRace(raceId: string): Promise<void> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("not-signed-in");
  const { error } = await sb.from("pinned_races").delete().eq("user_id", auth.user.id).eq("race_id", raceId);
  if (error) throw error;
}
