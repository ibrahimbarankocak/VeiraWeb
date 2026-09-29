export const card = "rounded-2xl border border-fg/10 bg-panel/70 p-4";
export const btn = "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition disabled:opacity-50";
export const btnApprove = `${btn} bg-mint-bright/20 text-mint-bright hover:bg-mint-bright/30`;
export const btnReject = `${btn} bg-red-500/15 text-red-400 hover:bg-red-500/25`;
export const btnNeutral = `${btn} border border-fg/20 text-fg/70 hover:border-fg/40 hover:text-fg`;

export function EmptyState({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-fg/40">{text}</p>;
}

export function Spinner() {
  return <p className="py-10 text-center text-sm text-fg/40">Yükleniyor…</p>;
}

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}
