"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RaceDetail } from "../../lib/races";
import { MONTHS_LONG } from "../../lib/i18n/translations";
import { useI18n } from "../../lib/i18n/context";
import { useUser } from "../../lib/useUser";
import { isRacePinned, pinRace, unpinRace } from "../../lib/racePlan";

function fmtKm(km: number) {
  return `${Number.isInteger(km) ? km : km.toFixed(1)}K`;
}

const daysBetween = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-fg/10 py-3 text-sm last:border-0">
      <dt className="text-fg/50">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}

function PinButton({ raceId }: { raceId: string }) {
  const { t } = useI18n();
  const { user, loading } = useUser();
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    isRacePinned(raceId).then((p) => alive && setPinned(p));
    return () => {
      alive = false;
    };
  }, [user, raceId]);

  if (loading) return null;

  async function toggle() {
    if (!user) {
      setMsg(t("raceDetail.pinLoginHint"));
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      if (pinned) {
        await unpinRace(raceId);
        setPinned(false);
      } else {
        await pinRace(raceId);
        setPinned(true);
      }
    } catch {
      setMsg(t("raceDetail.pinFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={toggle}
        disabled={busy}
        className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 font-display text-base font-bold uppercase tracking-wide transition disabled:opacity-60 ${
          pinned ? "border-mint-bright/50 bg-mint-bright/15 text-mint-bright" : "border-fg/20 text-fg hover:border-mint-bright"
        }`}
      >
        <span aria-hidden>{pinned ? "◉" : "⊕"}</span>
        {pinned ? t("raceDetail.pinnedCta") : t("raceDetail.pinCta")}
      </button>
      {msg && (
        <p className="mt-2 text-xs font-semibold text-fg/50">
          {!user ? (
            <Link href="/login" className="text-mint-bright hover:underline">
              {msg}
            </Link>
          ) : (
            msg
          )}
        </p>
      )}
    </div>
  );
}

function RegStatus({ open, close }: { open: string | null; close: string | null }) {
  const { t } = useI18n();
  if (!open && !close) return null;
  const today = new Date().toISOString().slice(0, 10);
  let label: string;
  let tone: "ok" | "warn" | "muted" | "info";
  if (close && today > close) {
    label = t("raceDetail.regClosed");
    tone = "muted";
  } else if (open && today < open) {
    const n = daysBetween(today, open);
    label = n <= 1 ? t("raceDetail.regOpensTomorrow") : t("raceDetail.regOpensIn", { n });
    tone = "info";
  } else if (close) {
    const n = daysBetween(today, close);
    label = n <= 0 ? t("raceDetail.regClosesToday") : n <= 14 ? t("raceDetail.regClosesIn", { n }) : t("raceDetail.regOpen");
    tone = n <= 14 ? "warn" : "ok";
  } else {
    label = t("raceDetail.regOpen");
    tone = "ok";
  }
  const colors = {
    ok: "bg-mint-bright/15 text-mint-bright",
    warn: "bg-amber-400/15 text-amber-400",
    muted: "bg-fg/10 text-fg/50",
    info: "bg-sky-400/15 text-sky-400",
  } as const;
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors[tone]}`}>{label}</span>;
}

export function RaceDetailView({ race }: { race: RaceDetail }) {
  const { t, lang } = useI18n();
  const [y, m, d] = race.date.split("-").map(Number);
  const showLocal = race.nameLocal && race.nameLocal !== race.name;

  return (
    <main>
      <section className="relative overflow-hidden px-5 pb-4 pt-28 md:px-8 md:pt-36">
        <div className="blob -left-40 top-0 h-[26rem] w-[26rem] bg-mint-bright/20" />
        <div className="relative mx-auto max-w-5xl">
          <Link href="/races" className="text-sm font-bold text-mint-bright hover:underline">
            ← {t("raceDetail.back")}
          </Link>
        </div>
      </section>

      <section className="px-5 md:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-fg/10 bg-panel/70">
          <div className="relative h-56 bg-gradient-to-br from-mint/60 via-[#0d3a26] to-ink sm:h-72">
            {race.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={race.image} alt="" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover opacity-90" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
            <div className="absolute left-5 top-5 rounded-xl bg-ink/80 px-3.5 py-2 text-center leading-none backdrop-blur">
              <p className="headline text-2xl text-fg">{d}</p>
              <p className="text-[10px] font-bold uppercase text-mint-bright">
                {MONTHS_LONG[lang][m - 1]?.slice(0, 3)} {y}
              </p>
            </div>
            <div className="absolute inset-x-5 bottom-5">
              <h1 className="font-display text-3xl font-bold uppercase leading-tight text-fg sm:text-5xl">{race.name}</h1>
              {showLocal && <p className="mt-1 text-sm text-fg/70">{race.nameLocal}</p>}
            </div>
          </div>

          <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[1fr_20rem]">
            <div>
              <div className="flex flex-wrap gap-2">
                {race.distances.length ? (
                  race.distances.map((k) => (
                    <span key={k} className="rounded-md bg-mint-bright/15 px-2.5 py-1 text-xs font-bold text-mint-bright">
                      {fmtKm(k)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-fg/40">{t("raceExplorer.distanceTba")}</span>
                )}
                <span className="rounded-md bg-fg/10 px-2.5 py-1 text-xs font-bold uppercase text-fg/70">
                  {t(`raceExplorer.type${race.type}`)}
                </span>
              </div>

              <dl className="mt-6 divide-y divide-fg/10">
                <Row label={t("raceDetail.location")}>
                  {race.location || t("raceExplorer.locationTba")}
                  {race.location && !race.location.toLowerCase().includes(race.country.toLowerCase()) ? `, ${race.country}` : ""}
                </Row>
                {race.elevationM != null && <Row label={t("raceDetail.elevation")}>{race.elevationM.toLocaleString()} m</Row>}
                {race.difficulty && <Row label={t("raceDetail.difficulty")}>{race.difficulty}</Row>}
                {race.terrainNote && <Row label={t("raceDetail.terrain")}>{race.terrainNote}</Row>}
                {race.timeLimitMin != null && (
                  <Row label={t("raceDetail.timeLimit")}>
                    {t("raceDetail.timeLimitValue", { h: Math.floor(race.timeLimitMin / 60), m: race.timeLimitMin % 60 })}
                  </Row>
                )}
                {race.fee != null && (
                  <Row label={t("raceDetail.fee")}>
                    {race.fee.toLocaleString()} {race.currency ?? ""}
                  </Row>
                )}
                {race.capacityPct != null && <Row label={t("raceDetail.capacity")}>%{Math.round(race.capacityPct)}</Row>}
                {race.organizer && <Row label={t("raceDetail.organizer")}>{race.organizer}</Row>}
                {race.contact && <Row label={t("raceDetail.contact")}>{race.contact}</Row>}
                {race.weather && <Row label={t("raceDetail.weather")}>{race.weather}</Row>}
              </dl>

              {race.prizes && (
                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-fg/45">{t("raceDetail.prizes")}</p>
                  <p className="mt-1.5 text-sm text-fg/75">{race.prizes}</p>
                </div>
              )}
              {race.sponsors && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-fg/45">{t("raceDetail.sponsors")}</p>
                  <p className="mt-1.5 text-sm text-fg/75">{race.sponsors}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {(race.regOpen || race.regClose) && (
                <div className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-fg/45">{t("raceDetail.regTitle")}</p>
                    <RegStatus open={race.regOpen} close={race.regClose} />
                  </div>
                  <dl className="mt-3 space-y-2 text-sm">
                    {race.regOpen && (
                      <div className="flex justify-between">
                        <dt className="text-fg/50">{t("raceDetail.regOpens")}</dt>
                        <dd className="font-semibold">{race.regOpen}</dd>
                      </div>
                    )}
                    {race.regClose && (
                      <div className="flex justify-between">
                        <dt className="text-fg/50">{t("raceDetail.regCloses")}</dt>
                        <dd className="font-semibold">{race.regClose}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {race.url ? (
                <a href={race.url} target="_blank" rel="noopener noreferrer" className="btn-mint block w-full text-center">
                  {t("raceDetail.registerCta")}
                </a>
              ) : (
                <p className="rounded-2xl border border-fg/10 px-4 py-3 text-center text-sm font-semibold text-fg/40">
                  {t("raceDetail.registerMissing")}
                </p>
              )}

              {race.mapUrl && (
                <a
                  href={race.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-full border border-fg/20 px-6 py-3 text-center font-display text-base font-bold uppercase tracking-wide text-fg transition hover:border-mint-bright hover:text-mint-bright"
                >
                  {t("raceDetail.viewMap")}
                </a>
              )}

              <PinButton raceId={race.id} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
