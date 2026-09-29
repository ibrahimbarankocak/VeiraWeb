"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { btnNeutral, btnReject, card, EmptyState, Spinner } from "./shared";
import { AddRaceForm } from "./AddRaceForm";

type Row = {
  id: string;
  yaris_adi: string;
  tarih: string | null;
  konum_metin: string | null;
  status: string;
};

const STATUS_LABEL: Record<string, string> = { approved: "Onaylı", pending: "Bekliyor", rejected: "Reddedildi" };
const STATUS_TONE: Record<string, string> = {
  approved: "bg-mint-bright/15 text-mint-bright",
  pending: "bg-amber-400/15 text-amber-400",
  rejected: "bg-red-500/15 text-red-400",
};

export function AllRaces() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const handle = setTimeout(() => {
      setRows(null);
      const base = getSupabase().from("races").select("id,yaris_adi,tarih,konum_metin,status");
      const filtered = q.trim() ? base.ilike("yaris_adi", `%${q.trim()}%`) : base;
      filtered.order("sisteme_eklenme_tarihi", { ascending: false }).limit(50).then(({ data, error }) => {
        if (!alive) return;
        if (error) setError(error.message);
        setRows((data as Row[]) ?? []);
      });
    }, 300);
    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [q, refresh]);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    const { error } = await getSupabase().from("races").update({ status }).eq("id", id);
    if (error) setError(error.message);
    else setRefresh((r) => r + 1);
    setBusy(null);
  }

  async function remove(id: string, name: string) {
    if (!confirm(`"${name}" kalıcı olarak silinsin mi?`)) return;
    setBusy(id);
    const { error } = await getSupabase().from("races").delete().eq("id", id);
    if (error) setError(error.message);
    else setRefresh((r) => r + 1);
    setBusy(null);
  }

  return (
    <div>
      <div className="mb-4">
        <AddRaceForm onAdded={() => setRefresh((r) => r + 1)} />
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Yarış adına göre ara…"
        className="mb-4 h-11 w-full max-w-md rounded-xl border border-fg/10 bg-fg/[0.04] px-3 text-sm outline-none focus:border-mint-bright"
      />
      {error && <p className="mb-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
      {rows === null ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState text="Sonuç yok." />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className={`${card} flex flex-wrap items-center gap-3`}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{r.yaris_adi}</p>
                <p className="text-xs text-fg/45">{r.tarih ?? "—"} · {r.konum_metin ?? "—"}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS_TONE[r.status] ?? "bg-fg/10 text-fg/50"}`}>
                {STATUS_LABEL[r.status] ?? r.status}
              </span>
              {r.status !== "approved" && (
                <button className={btnNeutral} disabled={busy === r.id} onClick={() => setStatus(r.id, "approved")}>
                  Onayla
                </button>
              )}
              {r.status !== "rejected" && (
                <button className={btnNeutral} disabled={busy === r.id} onClick={() => setStatus(r.id, "rejected")}>
                  Reddet
                </button>
              )}
              <button className={btnReject} disabled={busy === r.id} onClick={() => remove(r.id, r.yaris_adi)}>
                Sil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
