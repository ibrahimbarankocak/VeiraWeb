import type { MetadataRoute } from "next";
import { getSupabase } from "../lib/supabase";

const BASE = "https://www.appveira.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/races`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const { data } = await getSupabase()
      .from("races")
      .select("id")
      .eq("status", "approved")
      .limit(1000);
    const raceRoutes: MetadataRoute.Sitemap = (data ?? []).map((r: { id: string }) => ({
      url: `${BASE}/races/${r.id}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    return [...staticRoutes, ...raceRoutes];
  } catch {
    return staticRoutes;
  }
}
