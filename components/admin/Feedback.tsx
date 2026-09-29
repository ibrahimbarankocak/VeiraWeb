"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { btnNeutral, card, EmptyState, fmtDate, Spinner } from "./shared";

type Row = {
  id: string;
  email: string | null;
  category: string;
  message: string;
  status: string;
  created_at: string | null;
};

const CATEGORY_LABEL: Record<string, string> = { bug: "Hata bildirimi", suggestion: "Öneri", other: "Diğer" };

export function Feedback() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setRows(null);
    getSupabase()
      .from("feedback")
      .select("id,email,category,message,status,created_at")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setError(error.message);
        setRows((data as Row[]) ?? []);
      });
    return () => {
      alive = false;
    };
  }, [refresh]);

  async function markReviewed(id: string) {
    setBusy(id);
    const { error } = await getSupabase().from("feedback").update({ status: "reviewed" }).eq("id", id);
    if (error) setError(error.message);
    else setRefresh((r) => r + 1);
    setBusy(null);
  }

  if (rows === null) return <Spinner />;
  if (rows.length === 0) return <EmptyState text="Geri bildirim yok." />;

  return (
    <div className="space-y-3">
      {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
      {rows.map((r) => (
        <div key={r.id} className={card}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-fg/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-fg/60">
                  {CATEGORY_LABEL[r.category] ?? r.category}
                </span>
                {r.status === "new" && <span className="rounded-full bg-mint-bright/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-mint-bright">Yeni</span>}
              </div>
              <p className="mt-2 text-sm text-fg/85">{r.message}</p>
              <p className="mt-1 text-[11px] text-fg/35">
                {r.email ?? "e-posta yok"} · {fmtDate(r.created_at)}
              </p>
            </div>
            {r.status !== "reviewed" && (
              <button className={`${btnNeutral} shrink-0`} disabled={busy === r.id} onClick={() => markReviewed(r.id)}>
                İncelendi işaretle
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
