"use client";

import { useState, type FormEvent } from "react";
import { getSupabase } from "../../lib/supabase";
import { btnNeutral, btnPrimary, card, errMsg, field, input, label } from "./shared";

// Matches the ground values the site already classifies (see TYPES in lib/races.ts).
const GROUNDS = [
  { value: "", label: "Seçilmedi" },
  { value: "Yol koşusu", label: "Yol koşusu" },
  { value: "Trail", label: "Trail" },
  { value: "Ultra", label: "Ultra" },
  { value: "Triatlon", label: "Triatlon" },
  { value: "Bisiklet", label: "Bisiklet" },
  { value: "Yürüyüş", label: "Yürüyüş" },
];

export function AddRaceForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const date = String(f.get("date") || "").trim();
    const location = String(f.get("location") || "").trim();
    if (!name || !date || !location) {
      setError("Yarış adı, tarih ve konum zorunlu.");
      return;
    }
    if (!/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(date)) {
      setError("Tarih GG.AA.YYYY biçiminde olmalı (örn: 20.09.2026).");
      return;
    }
    setSaving(true);
    try {
      const { data: auth } = await getSupabase().auth.getUser();
      const payload: Record<string, unknown> = {
        yaris_adi: name,
        tarih: date,
        konum_metin: location,
        status: "approved",
        created_by: auth.user?.id ?? null,
      };
      const nameEn = String(f.get("nameEn") || "").trim();
      const country = String(f.get("country") || "").trim();
      const distance = String(f.get("distance") || "").trim();
      const ground = String(f.get("ground") || "").trim();
      const url = String(f.get("url") || "").trim();
      const thumbnail = String(f.get("thumbnail") || "").trim();
      const regOpen = String(f.get("regOpen") || "").trim();
      const regClose = String(f.get("regClose") || "").trim();
      if (nameEn) payload.yaris_adi_en = nameEn;
      if (country) payload.country = country;
      if (distance) payload.uzunluk_km = distance;
      if (ground) payload.zemin_turu = ground;
      if (url) payload.kayit_url = url;
      if (thumbnail) payload.thumbnail_url = thumbnail;
      if (regOpen) payload.kayit_baslangic_tarihi = regOpen;
      if (regClose) payload.kayit_bitis_tarihi = regClose;

      const { error } = await getSupabase().from("races").insert(payload);
      if (error) throw error;
      (e.target as HTMLFormElement).reset();
      setOpen(false);
      onAdded();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button className={btnPrimary} onClick={() => setOpen(true)}>
        + Yeni yarış ekle
      </button>
    );
  }

  return (
    <form onSubmit={submit} className={`${card} space-y-3`}>
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold uppercase">Yeni yarış</p>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-fg/50 hover:text-fg">
          Kapat
        </button>
      </div>
      {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={field}>
          <label className={label}>Yarış adı*</label>
          <input name="name" required className={input} />
        </div>
        <div className={field}>
          <label className={label}>İngilizce adı</label>
          <input name="nameEn" className={input} />
        </div>
        <div className={field}>
          <label className={label}>Tarih* (GG.AA.YYYY)</label>
          <input name="date" required placeholder="20.09.2026" className={input} />
        </div>
        <div className={field}>
          <label className={label}>Konum*</label>
          <input name="location" required placeholder="İstanbul, Türkiye" className={input} />
        </div>
        <div className={field}>
          <label className={label}>Ülke</label>
          <input name="country" placeholder="Türkiye" className={input} />
        </div>
        <div className={field}>
          <label className={label}>Mesafeler</label>
          <input name="distance" placeholder="5K, 10K, 21K" className={input} />
        </div>
        <div className={field}>
          <label className={label}>Zemin</label>
          <select name="ground" defaultValue="" className={input}>
            {GROUNDS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
        <div className={field}>
          <label className={label}>Kayıt linki</label>
          <input name="url" type="url" placeholder="https://…" className={input} />
        </div>
        <div className={field}>
          <label className={label}>Kapak görseli URL</label>
          <input name="thumbnail" type="url" placeholder="https://…" className={input} />
        </div>
        <div className={field}>
          <label className={label}>Kayıt başlangıcı (GG.AA.YYYY)</label>
          <input name="regOpen" placeholder="01.06.2026" className={input} />
        </div>
        <div className={field}>
          <label className={label}>Kayıt bitişi (GG.AA.YYYY)</label>
          <input name="regClose" placeholder="15.09.2026" className={input} />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Kaydediliyor…" : "Yarışı ekle"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={btnNeutral}>
          Vazgeç
        </button>
      </div>
    </form>
  );
}
