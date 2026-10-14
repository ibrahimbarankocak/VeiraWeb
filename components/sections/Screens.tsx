import { PhoneShot } from "../ui/PhoneFrame";

export function HomeScreen() {
  return <PhoneShot src="/screens/home.webp" alt="Veira home screen — next race countdown and weekly running rhythm" />;
}

export function LeagueScreen() {
  return <PhoneShot src="/screens/league.webp" alt="Veira weekly league leaderboard, ranked by pace" />;
}

export function InventoryScreen() {
  return <PhoneShot src="/screens/inventory.webp" alt="Veira shoe cabinet tracking kilometres per pair" />;
}

export function ClubsScreen() {
  return <PhoneShot src="/screens/clubs.webp" alt="Veira running clubs near you" />;
}

export function PlanScreen() {
  return <PhoneShot src="/screens/plan.webp" alt="Veira season plan with race calendar and monthly totals" />;
}
