import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "../../../components/sections/Navbar";
import { Footer } from "../../../components/sections/Footer";
import { RaceDetailView } from "../../../components/races/RaceDetailView";
import { getRaceById } from "../../../lib/races";

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const race = await getRaceById(id).catch(() => null);
  if (!race) return { title: "Veira" };
  return {
    title: `${race.name} — Veira`,
    description: `${race.name} — ${race.location || race.country}, ${race.date}.`,
  };
}

export default async function RaceDetailPage({ params }: Props) {
  const { id } = await params;
  const race = await getRaceById(id).catch(() => null);
  if (!race) notFound();

  return (
    <>
      <Navbar />
      <RaceDetailView race={race} />
      <div className="h-20" />
      <Footer />
    </>
  );
}
