"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import { btnApprove, btnReject, card, EmptyState, fmtDate, Spinner } from "./shared";

type Row = {
  id: string;
  user_id: string;
  club_name: string;
  message: string | null;
  country: string | null;
  city: string | null;
  province: string | null;
  member_range: string | null;
  created_at: string | null;
};

function isMissingFn(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e);
  return m.includes("PGRST202") || m.includes("42883") || /could not find the function/i.test(m);
}

export function OwnerRequests() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setRows(null);
    getSupabase()
      .from("owner_requests")
      .select("id,user_id,club_name,message,country,city,province,member_range,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setError(error.message);
        setRows((data as Row[]) ?? []);
      });
    return () => {
      alive = false;
    };
  }, [refresh]);

  async function decide(req: Row, status: "approved" | "rejected") {
    setBusy(req.id);
    setError(null);
    try {
      try {
        const fn = status === "approved" ? "approve_owner_request" : "reject_owner_request";
        const { error } = await getSupabase().rpc(fn, { p_request_id: req.id });
        if (error) throw error;
      } catch (e) {
        if (!isMissingFn(e)) throw e;
        // No SECURITY DEFINER function yet — fall back to a direct update (needs an admin RLS policy).
        const { data, error } = await getSupabase()
          .from("owner_requests")
          .update({ status, reviewed_at: new Date().toISOString() })
          .eq("id", req.id)
          .select("id");
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("Güncelleme engellendi (RLS?) — 0 satır etkilendi.");
      }
      setRefresh((r) => r + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  if (rows === null) return <Spinner />;
  if (rows.length === 0) return <EmptyState text="Bekleyen kulüp başvurusu yok." />;

  return (
    <div className="space-y-3">
      {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
      {rows.map((r) => (
        <div key={r.id} className={card}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-lg font-bold uppercase">{r.club_name}</p>
              <p className="text-xs text-fg/45">
                {[r.city, r.province, r.country].filter(Boolean).join(", ") || "Konum belirtilmemiş"}
                {r.member_range ? ` · ${r.member_range} üye` : ""}
              </p>
              <p className="text-[11px] text-fg/35">Başvuru: {fmtDate(r.created_at)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button className={btnApprove} disabled={busy === r.id} onClick={() => decide(r, "approved")}>
                Onayla
              </button>
              <button className={btnReject} disabled={busy === r.id} onClick={() => decide(r, "rejected")}>
                Reddet
              </button>
            </div>
          </div>
          {r.message && <p className="mt-3 text-sm text-fg/70">{r.message}</p>}
        </div>
      ))}
    </div>
  );
}
