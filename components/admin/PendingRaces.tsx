"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { btnApprove, btnReject, card, EmptyState, fmtDate, Spinner } from "./shared";

type Row = {
  id: string;
  yaris_adi: string;
  yaris_adi_en: string | null;
  tarih: string | null;
  konum_metin: string | null;
  country: string | null;
  kayit_url: string | null;
  thumbnail_url: string | null;
  sisteme_eklenme_tarihi: string | null;
};

export function PendingRaces() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setRows(null);
    getSupabase()
      .from("races")
      .select("id,yaris_adi,yaris_adi_en,tarih,konum_metin,country,kayit_url,thumbnail_url,sisteme_eklenme_tarihi")
      .eq("status", "pending")
      .order("sisteme_eklenme_tarihi", { ascending: false })
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setError(error.message);
        setRows((data as Row[]) ?? []);
      });
    return () => {
      alive = false;
    };
  }, [refresh]);

  async function decide(id: string, status: "approved" | "rejected") {
    setBusy(id);
    setError(null);
    const { error } = await getSupabase().from("races").update({ status }).eq("id", id);
    if (error) setError(error.message);
    else setRefresh((r) => r + 1);
    setBusy(null);
  }

  if (rows === null) return <Spinner />;
  if (rows.length === 0) return <EmptyState text="Bekleyen yarış yok." />;

  return (
    <div className="space-y-3">
      {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
      {rows.map((r) => (
        <div key={r.id} className={`${card} flex flex-wrap items-center gap-4`}>
          {r.thumbnail_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.thumbnail_url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" referrerPolicy="no-referrer" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-bold uppercase">{r.yaris_adi}</p>
            <p className="text-xs text-fg/50">
              {r.tarih ?? "tarih yok"} · {r.konum_metin ?? "konum yok"} {r.country ? `· ${r.country}` : ""}
            </p>
            <p className="text-[11px] text-fg/35">Eklenme: {fmtDate(r.sisteme_eklenme_tarihi)}</p>
            {r.kayit_url && (
              <a href={r.kayit_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-mint-bright hover:underline">
                Kayıt linki ↗
              </a>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <button className={btnApprove} disabled={busy === r.id} onClick={() => decide(r.id, "approved")}>
              Onayla
            </button>
            <button className={btnReject} disabled={busy === r.id} onClick={() => decide(r.id, "rejected")}>
              Reddet
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
