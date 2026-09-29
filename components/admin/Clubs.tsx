"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getSupabase } from "../../lib/supabase";
import { btnNeutral, btnPrimary, btnReject, card, EmptyState, field, input, label, Spinner } from "./shared";

type Club = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  pace_level: string | null;
  schedule_text: string | null;
  avatar_url: string | null;
  owner_id: string | null;
};

const PACE_LEVELS = [
  { value: "", label: "Belirtilmedi" },
  { value: "beginner", label: "Yeni başlayan" },
  { value: "social", label: "Sosyal" },
  { value: "tempo", label: "Tempo" },
];

function AddClubForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    if (!name) {
      setError("Kulüp adı zorunlu.");
      return;
    }
    setSaving(true);
    try {
      const { data: auth } = await getSupabase().auth.getUser();
      const ownerId = auth.user?.id;
      if (!ownerId) throw new Error("Oturum bulunamadı.");
      const payload: Record<string, unknown> = { name, owner_id: ownerId };
      const description = String(f.get("description") || "").trim();
      const city = String(f.get("city") || "").trim();
      const pace = String(f.get("pace") || "").trim();
      const schedule = String(f.get("schedule") || "").trim();
      const avatar = String(f.get("avatar") || "").trim();
      if (description) payload.description = description;
      if (city) payload.city = city;
      if (pace) payload.pace_level = pace;
      if (schedule) payload.schedule_text = schedule;
      if (avatar) payload.avatar_url = avatar;

      const { data: club, error } = await getSupabase().from("clubs").insert(payload).select("id").single();
      if (error) throw error;
      // The creator becomes the club's owner member, mirroring how the app's owner-application flow works.
      await getSupabase().from("club_members").insert({ club_id: club.id, user_id: ownerId, role: "owner" });
      (e.target as HTMLFormElement).reset();
      setOpen(false);
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button className={btnPrimary} onClick={() => setOpen(true)}>
        + Yeni kulüp ekle
      </button>
    );
  }

  return (
    <form onSubmit={submit} className={`${card} space-y-3`}>
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold uppercase">Yeni kulüp</p>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-fg/50 hover:text-fg">
          Kapat
        </button>
      </div>
      {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={field}>
          <label className={label}>Kulüp adı*</label>
          <input name="name" required className={input} />
        </div>
        <div className={field}>
          <label className={label}>Şehir</label>
          <input name="city" placeholder="İstanbul" className={input} />
        </div>
        <div className={field}>
          <label className={label}>Tempo seviyesi</label>
          <select name="pace" defaultValue="" className={input}>
            {PACE_LEVELS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className={field}>
          <label className={label}>Logo URL</label>
          <input name="avatar" type="url" placeholder="https://…" className={input} />
        </div>
        <div className={`${field} sm:col-span-2`}>
          <label className={label}>Program</label>
          <input name="schedule" placeholder="Her salı 19:00, sahil koşusu" className={input} />
        </div>
        <div className={`${field} sm:col-span-2`}>
          <label className={label}>Açıklama</label>
          <textarea name="description" rows={2} className={`${input} h-auto py-2`} />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Kaydediliyor…" : "Kulübü ekle"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={btnNeutral}>
          Vazgeç
        </button>
      </div>
    </form>
  );
}

function ClubRow({ club, onChanged }: { club: Club; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const updates = {
      name: String(f.get("name") || "").trim(),
      city: String(f.get("city") || "").trim() || null,
      pace_level: String(f.get("pace") || "").trim() || null,
      schedule_text: String(f.get("schedule") || "").trim() || null,
      description: String(f.get("description") || "").trim() || null,
    };
    const { error } = await getSupabase().from("clubs").update(updates).eq("id", club.id);
    setSaving(false);
    if (error) setError(error.message);
    else {
      setEditing(false);
      onChanged();
    }
  }

  async function remove() {
    if (!confirm(`"${club.name}" kalıcı olarak silinsin mi?`)) return;
    setSaving(true);
    // club_members has a foreign key on club_id — clear those first so the delete doesn't fail.
    await getSupabase().from("club_members").delete().eq("club_id", club.id);
    const { error } = await getSupabase().from("clubs").delete().eq("id", club.id);
    setSaving(false);
    if (error) setError(error.message);
    else onChanged();
  }

  if (editing) {
    return (
      <form onSubmit={save} className={`${card} space-y-3`}>
        {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={field}>
            <label className={label}>Kulüp adı*</label>
            <input name="name" required defaultValue={club.name} className={input} />
          </div>
          <div className={field}>
            <label className={label}>Şehir</label>
            <input name="city" defaultValue={club.city ?? ""} className={input} />
          </div>
          <div className={field}>
            <label className={label}>Tempo seviyesi</label>
            <select name="pace" defaultValue={club.pace_level ?? ""} className={input}>
              {PACE_LEVELS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className={field}>
            <label className={label}>Program</label>
            <input name="schedule" defaultValue={club.schedule_text ?? ""} className={input} />
          </div>
          <div className={`${field} sm:col-span-2`}>
            <label className={label}>Açıklama</label>
            <textarea name="description" rows={2} defaultValue={club.description ?? ""} className={`${input} h-auto py-2`} />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className={btnNeutral}>
            Vazgeç
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={`${card} flex flex-wrap items-center gap-3`}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{club.name}</p>
        <p className="text-xs text-fg/45">
          {club.city ?? "Şehir yok"} {club.pace_level ? `· ${PACE_LEVELS.find((p) => p.value === club.pace_level)?.label ?? club.pace_level}` : ""}
        </p>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
      <button className={btnNeutral} disabled={saving} onClick={() => setEditing(true)}>
        Düzenle
      </button>
      <button className={btnReject} disabled={saving} onClick={remove}>
        Sil
      </button>
    </div>
  );
}

export function Clubs() {
  const [rows, setRows] = useState<Club[] | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setRows(null);
    getSupabase()
      .from("clubs")
      .select("id,name,description,city,pace_level,schedule_text,avatar_url,owner_id")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setError(error.message);
        setRows((data as Club[]) ?? []);
      });
    return () => {
      alive = false;
    };
  }, [refresh]);

  return (
    <div>
      <div className="mb-4">
        <AddClubForm onAdded={() => setRefresh((r) => r + 1)} />
      </div>
      {error && <p className="mb-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
      {rows === null ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState text="Kulüp yok." />
      ) : (
        <div className="space-y-2">
          {rows.map((c) => (
            <ClubRow key={c.id} club={c} onChanged={() => setRefresh((r) => r + 1)} />
          ))}
        </div>
      )}
    </div>
  );
}
