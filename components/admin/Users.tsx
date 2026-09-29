"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { btnNeutral, btnPrimary, card, errMsg, field, input, label } from "./shared";

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
};

type Club = {
  id: string;
  name: string;
};

function UserSearch({ onPick }: { onPick: (p: Profile) => void }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    let alive = true;
    const t = setTimeout(() => {
      getSupabase()
        .from("profiles")
        .select("id,username,avatar_url,role")
        .ilike("username", `%${q}%`)
        .order("username")
        .limit(20)
        .then(({ data, error }) => {
          if (!alive) return;
          if (error) setError(error.message);
          else setError(null);
          setResults((data as Profile[]) ?? []);
        });
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [term]);

  return (
    <div>
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Kullanıcı adına göre ara…"
        className={input}
      />
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {results && (
        <div className="mt-2 max-h-64 space-y-1 overflow-y-auto">
          {results.length === 0 ? (
            <p className="py-3 text-center text-xs text-fg/40">Sonuç yok.</p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPick(p)}
                className="flex w-full items-center justify-between rounded-lg border border-fg/10 bg-fg/[0.03] px-3 py-2 text-left text-sm hover:border-mint-bright"
              >
                <span>{p.username ?? p.id}</span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-fg/40">{p.role ?? "user"}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function RoleSection() {
  const [picked, setPicked] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function setRole(role: "user" | "admin") {
    if (!picked) return;
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const { data, error } = await getSupabase()
        .from("profiles")
        .update({ role })
        .eq("id", picked.id)
        .select("id,username,avatar_url,role");
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Güncelleme engellendi (RLS?) — 0 satır etkilendi.");
      setPicked(data[0] as Profile);
      setOk(`${data[0].username ?? picked.id} artık "${role}".`);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`${card} space-y-3`}>
      <p className="font-display text-lg font-bold uppercase">Web/App admin ata</p>
      <UserSearch onPick={(p) => { setPicked(p); setError(null); setOk(null); }} />
      {picked && (
        <div className="rounded-lg border border-fg/10 bg-fg/[0.03] p-3">
          <p className="text-sm">
            Seçilen: <span className="font-bold">{picked.username ?? picked.id}</span>{" "}
            <span className="text-fg/40">({picked.role ?? "user"})</span>
          </p>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          {ok && <p className="mt-2 text-xs text-mint-bright">{ok}</p>}
          <div className="mt-3 flex gap-2">
            <button
              disabled={busy || picked.role === "admin"}
              onClick={() => setRole("admin")}
              className={btnPrimary}
            >
              Admin yap
            </button>
            <button
              disabled={busy || picked.role === "user" || !picked.role}
              onClick={() => setRole("user")}
              className={btnNeutral}
            >
              Normal kullanıcı yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClubOwnerSection() {
  const [clubs, setClubs] = useState<Club[] | null>(null);
  const [clubId, setClubId] = useState("");
  const [picked, setPicked] = useState<Profile | null>(null);
  const [role, setRole] = useState<"owner" | "member">("owner");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    getSupabase()
      .from("clubs")
      .select("id,name")
      .order("name")
      .then(({ data }) => setClubs((data as Club[]) ?? []));
  }, []);

  async function assign() {
    if (!clubId || !picked) return;
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const { data, error } = await getSupabase()
        .from("club_members")
        .upsert({ club_id: clubId, user_id: picked.id, role }, { onConflict: "club_id,user_id" })
        .select("club_id,user_id,role");
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("İşlem engellendi (RLS?) — 0 satır etkilendi.");
      setOk(`${picked.username ?? picked.id} → "${role}" olarak atandı.`);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!clubId || !picked) return;
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const { error } = await getSupabase()
        .from("club_members")
        .delete()
        .eq("club_id", clubId)
        .eq("user_id", picked.id);
      if (error) throw error;
      setOk(`${picked.username ?? picked.id} kulüpten çıkarıldı.`);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`${card} space-y-3`}>
      <p className="font-display text-lg font-bold uppercase">Kulüp yöneticisi ata</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={field}>
          <label className={label}>Kulüp</label>
          <select value={clubId} onChange={(e) => setClubId(e.target.value)} className={input}>
            <option value="">Seç…</option>
            {clubs?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className={field}>
          <label className={label}>Rol</label>
          <select value={role} onChange={(e) => setRole(e.target.value as "owner" | "member")} className={input}>
            <option value="owner">Yönetici (owner)</option>
            <option value="member">Üye (member)</option>
          </select>
        </div>
      </div>
      <UserSearch onPick={(p) => { setPicked(p); setError(null); setOk(null); }} />
      {picked && (
        <div className="rounded-lg border border-fg/10 bg-fg/[0.03] p-3">
          <p className="text-sm">
            Seçilen kullanıcı: <span className="font-bold">{picked.username ?? picked.id}</span>
          </p>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          {ok && <p className="mt-2 text-xs text-mint-bright">{ok}</p>}
          <div className="mt-3 flex gap-2">
            <button disabled={busy || !clubId} onClick={assign} className={btnPrimary}>
              Ata
            </button>
            <button disabled={busy || !clubId} onClick={remove} className={btnNeutral}>
              Kulüpten çıkar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Users() {
  return (
    <div className="space-y-4">
      <RoleSection />
      <ClubOwnerSection />
    </div>
  );
}
