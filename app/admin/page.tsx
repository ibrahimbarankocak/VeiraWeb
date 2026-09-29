"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "../../components/sections/Navbar";
import { useUser } from "../../lib/useUser";
import { useIsAdmin } from "../../lib/useAdmin";
import { PendingRaces } from "../../components/admin/PendingRaces";
import { AllRaces } from "../../components/admin/AllRaces";
import { OwnerRequests } from "../../components/admin/OwnerRequests";
import { Feedback } from "../../components/admin/Feedback";

const TABS = [
  { key: "pending", label: "Bekleyen yarışlar", render: () => <PendingRaces /> },
  { key: "all", label: "Tüm yarışlar", render: () => <AllRaces /> },
  { key: "owners", label: "Kulüp başvuruları", render: () => <OwnerRequests /> },
  { key: "feedback", label: "Geri bildirim", render: () => <Feedback /> },
] as const;

export default function AdminPage() {
  const { user, loading } = useUser();
  const { isAdmin, ready } = useIsAdmin();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("pending");

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="px-5 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="mx-auto max-w-5xl">
          {loading || !ready ? (
            <p className="py-24 text-center text-fg/50">Yükleniyor…</p>
          ) : !user ? (
            <div className="py-24 text-center">
              <p className="headline text-4xl">Giriş yapmalısın</p>
              <Link href="/login" className="btn-mint mt-6 inline-flex">
                Giriş yap
              </Link>
            </div>
          ) : !isAdmin ? (
            <div className="py-24 text-center">
              <p className="headline text-4xl">Bu sayfa sadece admin içindir</p>
              <p className="mt-2 text-fg/50">Bu hesabın admin yetkisi yok.</p>
            </div>
          ) : (
            <>
              <p className="eyebrow mb-3">Admin</p>
              <h1 className="headline text-[clamp(2.4rem,6vw,4rem)]">Yönetim paneli</h1>

              <div className="mt-8 flex flex-wrap gap-2 border-b border-fg/10 pb-4">
                {TABS.map((tb) => (
                  <button
                    key={tb.key}
                    onClick={() => setTab(tb.key)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      tab === tb.key ? "bg-mint-bright text-onbright" : "bg-fg/[0.06] text-fg/60 hover:bg-fg/10 hover:text-fg"
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              <div className="mt-6">{TABS.find((tb) => tb.key === tab)?.render()}</div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
