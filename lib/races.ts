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

/** Extra columns only the race detail page needs — almost all are blank on most rows today. */
type DetailRow = Row & {
  irtifa_kazanimi_m: string | null;
  zorluk_seviyesi: string | null;
  doga_dokusu: string | null;
  enlem: string | number | null;
  boylam: string | number | null;
  parkur_harita_linki: string | null;
  organizator: string | null;
  iletisim_bilgileri: string | null;
  kayit_baslangic_tarihi: string | null;
  kayit_bitis_tarihi: string | null;
  kontenjan_doluluk_yuzdesi: string | number | null;
  ucret: string | number | null;
  para_birimi: string | null;
  sure_siniri_dakika: string | number | null;
  oduller: string | null;
  sponsorlar: string | null;
  beklenen_hava_durumu: string | null;
  status: string | null;
};

export type RaceDetail = Race & {
  elevationM: number | null;
  difficulty: string | null;
  terrainNote: string | null;
  lat: number | null;
  lng: number | null;
  mapUrl: string | null;
  organizer: string | null;
  contact: string | null;
  regOpen: string | null;
  regClose: string | null;
  capacityPct: number | null;
  fee: number | null;
  currency: string | null;
  timeLimitMin: number | null;
  prizes: string | null;
  sponsors: string | null;
  weather: string | null;
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

const num = (v: string | number | null): number | null => {
  if (v === null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

const DETAIL_COLUMNS =
  COLUMNS +
  ",irtifa_kazanimi_m,zorluk_seviyesi,doga_dokusu,enlem,boylam,parkur_harita_linki,organizator,iletisim_bilgileri," +
  "kayit_baslangic_tarihi,kayit_bitis_tarihi,kontenjan_doluluk_yuzdesi,ucret,para_birimi,sure_siniri_dakika," +
  "oduller,sponsorlar,beklenen_hava_durumu,status";

/** A single approved race with every detail column. Returns null if not found (or not approved). */
export async function getRaceById(id: string): Promise<RaceDetail | null> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const res = await fetch(`${base}/rest/v1/races?select=${DETAIL_COLUMNS}&id=eq.${encodeURIComponent(id)}&status=eq.approved`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Supabase race request failed: ${res.status}`);
  const rows: DetailRow[] = await res.json();
  const r = rows[0];
  if (!r || !r.yaris_adi) return null;

  const date = parseDate(r.tarih);
  const distances = parseDistances(r.uzunluk_km);
  const buckets = [...new Set(distances.map(bucketOf).filter((b): b is DistanceBucket => !!b))];
  const lat = num(r.enlem);
  const lng = num(r.boylam);

  return {
    id: r.id,
    name: r.yaris_adi_en || r.yaris_adi,
    nameLocal: r.yaris_adi,
    date: date ?? "",
    location: r.konum_metin ?? "",
    country: r.country ?? "Unknown",
    distances,
    buckets,
    type: TYPES[(r.zemin_turu ?? "").toLocaleLowerCase("tr")] ?? "Other",
    url: r.kayit_url,
    image: r.thumbnail_url,
    added: r.sisteme_eklenme_tarihi ?? "",
    elevationM: num(r.irtifa_kazanimi_m),
    difficulty: r.zorluk_seviyesi || null,
    terrainNote: r.doga_dokusu || null,
    lat,
    lng,
    mapUrl: r.parkur_harita_linki || (lat != null && lng != null ? `https://www.google.com/maps?q=${lat},${lng}` : null),
    organizer: r.organizator || null,
    contact: r.iletisim_bilgileri || null,
    regOpen: parseDate(r.kayit_baslangic_tarihi),
    regClose: parseDate(r.kayit_bitis_tarihi),
    capacityPct: num(r.kontenjan_doluluk_yuzdesi),
    fee: num(r.ucret),
    currency: r.para_birimi || null,
    timeLimitMin: num(r.sure_siniri_dakika),
    prizes: r.oduller || null,
    sponsors: r.sponsorlar || null,
    weather: r.beklenen_hava_durumu || null,
  };
}
