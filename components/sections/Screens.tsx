import { PhoneFrame } from "../ui/PhoneFrame";

const card = "rounded-2xl border border-white/10 bg-white/[0.04]";

export function HomeScreen() {
  const bars = [30, 55, 20, 75, 45, 90, 35];
  return (
    <PhoneFrame active="Home" tint="rgba(40,104,72,0.4)">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">Good morning</p>
      <p className="headline text-4xl normal-case">Hey, Baran</p>
      <div className={`${card} mt-3 p-3`}>
        <p className="text-[9px] font-bold uppercase tracking-widest text-mint-bright">Next race</p>
        <p className="mt-1 text-sm font-bold">Bosphorus Cross-Continental</p>
        <p className="headline mt-1 text-4xl text-mint-light">
          12 <span className="text-base text-white/50">days</span>
        </p>
      </div>
      <div className={`${card} mt-3 p-3`}>
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Weekly rhythm</p>
        <div className="mt-2 flex h-16 items-end gap-1.5">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-mint to-mint-bright" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

export function LeagueScreen() {
  const rows = [
    ["04", "Ece K.", "4:13"],
    ["05", "Mert D.", "4:18"],
    ["06", "You", "4:25"],
    ["07", "Kaan S.", "4:31"],
  ];
  return (
    <PhoneFrame active="League" tint="rgba(120,60,120,0.3)">
      <div className={`${card} flex items-center justify-between p-3`}>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Weekly reset</p>
          <p className="headline text-3xl normal-case">
            2 days <span className="text-base text-mint-bright">14:22:09</span>
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-1.5 text-[10px] font-bold">
        {["5K", "10K", "21K", "42K"].map((d) => (
          <span key={d} className={`rounded-lg px-2.5 py-1.5 ${d === "10K" ? "bg-mint text-mint-light" : "bg-white/5 text-white/50"}`}>
            {d}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-end justify-center gap-4 text-center">
        {[["E", "4:09", "h-9 w-9"], ["A", "3:56", "h-12 w-12"], ["M", "4:18", "h-9 w-9"]].map(([n, p, s]) => (
          <div key={n}>
            <div className={`mx-auto grid place-items-center rounded-full bg-mint font-bold ${s}`}>{n}</div>
            <p className="mt-1 text-[10px] font-bold">{p}</p>
          </div>
        ))}
      </div>
      <div className={`${card} mt-3 flex items-center gap-2 p-2.5 text-[10px]`}>
        <span className="grid h-6 w-6 place-items-center rounded-md bg-mint">↑</span>
        <span>
          <b>6 sec/km to rank up.</b> One sharp session could do it.
        </span>
      </div>
      <div className="mt-2 space-y-1">
        {rows.map(([r, n, p]) => (
          <div key={r} className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[11px] ${n === "You" ? "border border-mint-bright/30 bg-mint/30" : ""}`}>
            <span className="w-5 text-white/40">{r}</span>
            <span className="flex-1 font-bold">{n}</span>
            <span className="font-bold">{p} <span className="text-white/40">/km</span></span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

export function InventoryScreen() {
  const shoes = [
    ["Pegasus 41", 62, "312 km"],
    ["Vaporfly 3", 28, "84 km"],
    ["Speedgoat 6", 91, "455 km"],
  ];
  return (
    <PhoneFrame active="Inventory" tint="rgba(40,104,72,0.4)">
      <p className="headline text-4xl normal-case">Shoe cabinet</p>
      <div className="mt-3 space-y-2">
        {shoes.map(([n, life, km]) => (
          <div key={n as string} className={`${card} p-3`}>
            <div className="flex justify-between text-xs font-bold">
              <span>{n}</span>
              <span className="text-white/50">{km}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${(life as number) > 85 ? "bg-red-400" : "bg-mint-bright"}`}
                style={{ width: `${life}%` }}
              />
            </div>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-white/40">
              {life}% shoe life {(life as number) > 85 ? "· retire soon" : ""}
            </p>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

export function ClubsScreen() {
  const clubs = [
    ["Kadıköy Runners", "128 members"],
    ["Ege Trail Crew", "64 members"],
    ["Ankara Sabah Koşusu", "212 members"],
  ];
  return (
    <PhoneFrame active="Clubs" tint="rgba(40,104,72,0.4)">
      <p className="headline text-4xl normal-case">Running clubs</p>
      <div className="mt-3 space-y-2">
        {clubs.map(([n, m]) => (
          <div key={n} className={`${card} flex items-center gap-3 p-3`}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-mint text-xs font-bold">{n[0]}</span>
            <div className="flex-1">
              <p className="text-xs font-bold">{n}</p>
              <p className="text-[10px] text-white/45">{m}</p>
            </div>
            <span className="rounded-full bg-mint/40 px-2.5 py-1 text-[9px] font-bold">Join</span>
          </div>
        ))}
        <p className="pt-1 text-center text-[9px] font-semibold uppercase tracking-widest text-mint-bright">
          ✓ Admin-verified clubs
        </p>
      </div>
    </PhoneFrame>
  );
}
