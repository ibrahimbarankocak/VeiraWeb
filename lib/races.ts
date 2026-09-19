export type DistanceBucket = "5K" | "10K" | "21K" | "42K" | "Ultra";
export type RaceType = "Road" | "Trail" | "Ultra" | "Triathlon" | "Cycling" | "Walk" | "Other";

export type Race = {
  id: string;
  name: string;
  nameLocal: string;
  date: string; // YYYY-MM-DD
  location: string;
  country: string;
  distances: number[]; // km, ascending
  buckets: DistanceBucket[];
  type: RaceType;
  url: string | null;
  image: string | null;
  added: string;
};

type Row = {
  id: string;
  yaris_adi: string | null;
  yaris_adi_en: string | null;
  tarih: string | null;
  uzunluk_km: string | null;
  zemin_turu: string | null;
  konum_metin: string | null;
  country: string | null;
  kayit_url: string | null;
  thumbnail_url: string | null;
  sisteme_eklenme_tarihi: string | null;
};

const MONTHS: Record<string, number> = {
  ocak: 1, subat: 2, şubat: 2, mart: 3, nisan: 4, mayis: 5, mayıs: 5, haziran: 6,
  temmuz: 7, agustos: 8, ağustos: 8, eylul: 9, eylül: 9, ekim: 10, kasim: 11, kasım: 11, aralik: 12, aralık: 12,
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8,
  september: 9, october: 10, november: 11, december: 12,
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Handles "22.11.2026", "04 Ekim 2026", "18 September 2026", "05 - 06 March 2027". */
export function parseDate(raw: string | null): string | null {
  if (!raw) return null;
  const s = raw.trim();
  let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`;
  m = s.match(/^(\d{1,2})(?:\s*-\s*\d{1,2})?\s+([^\d\s]+)\s+(\d{4})$/);
  if (m) {
    const mo = MONTHS[m[2].toLocaleLowerCase("tr")] ?? MONTHS[m[2].toLowerCase()];
    if (mo) return `${m[3]}-${pad(mo)}-${pad(+m[1])}`;
  }
  return null;
}

/** "5K, 10K (YENİ), 21K", "42.2", "8,5K" → [5, 10, 21] ; time-based / TBC → []. */
export function parseDistances(raw: string | null): number[] {
  if (!raw) return [];
  const s = raw.trim();
  if (/saat|metre|x katları/i.test(s)) return [];
  const out = new Set<number>();
  if (/^\d+([.,]\d+)?$/.test(s)) out.add(parseFloat(s.replace(",", ".")));
  else for (const m of s.matchAll(/(\d+(?:[.,]\d+)?)\s*k\b/gi)) out.add(parseFloat(m[1].replace(",", ".")));
  return [...out].filter((n) => n > 0 && n < 1000).sort((a, b) => a - b);
}

export function bucketOf(km: number): DistanceBucket | null {
  if (km >= 3 && km <= 7.5) return "5K";
  if (km > 7.5 && km <= 15) return "10K";
  if (km > 15 && km <= 25) return "21K";
  if (km >= 40 && km <= 43) return "42K";
  if (km > 43) return "Ultra";
  return null;
}

const TYPES: Record<string, RaceType> = {
  "yol koşusu": "Road", trail: "Trail", ultra: "Ultra", triatlon: "Triathlon", bisiklet: "Cycling", yürüyüş: "Walk",
};

const COLUMNS =
  "id,yaris_adi,yaris_adi_en,tarih,uzunluk_km,zemin_turu,konum_metin,country,kayit_url,thumbnail_url,sisteme_eklenme_tarihi";

async function fetchRows(): Promise<Row[]> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const page = 1000;
  const rows: Row[] = [];
  for (let from = 0; ; from += page) {
    const res = await fetch(`${base}/rest/v1/races?select=${COLUMNS}&status=eq.approved&order=id`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + page - 1}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`Supabase races request failed: ${res.status}`);
    const chunk: Row[] = await res.json();
    rows.push(...chunk);
    if (chunk.length < page) return rows;
  }
}

/** Upcoming approved races, normalised. Undated or past races are dropped. */
export async function getRaces(): Promise<Race[]> {
  const rows = await fetchRows();
  const today = new Date().toISOString().slice(0, 10);
  const races: Race[] = [];
  for (const r of rows) {
    const date = parseDate(r.tarih);
    if (!date || date < today || !r.yaris_adi) continue;
    const distances = parseDistances(r.uzunluk_km);
    const buckets = [...new Set(distances.map(bucketOf).filter((b): b is DistanceBucket => !!b))];
    races.push({
      id: r.id,
      name: r.yaris_adi_en || r.yaris_adi,
      nameLocal: r.yaris_adi,
      date,
      location: r.konum_metin ?? "",
      country: r.country ?? "Unknown",
      distances,
      buckets,
      type: TYPES[(r.zemin_turu ?? "").toLocaleLowerCase("tr")] ?? "Other",
      url: r.kayit_url,
      image: r.thumbnail_url,
      added: r.sisteme_eklenme_tarihi ?? "",
    });
  }
  return races;
}
