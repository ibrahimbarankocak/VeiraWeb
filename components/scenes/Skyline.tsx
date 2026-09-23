// Night-city skyline drawn as SVG. Fully deterministic (seeded PRNG) so server and client render identically.

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Layer = {
  seed: number;
  fill: string;
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  lit: number; // probability that a window is lit
  gap: number;
};

const LAYERS: Layer[] = [
  { seed: 11, fill: "#0f4a35", minW: 90, maxW: 190, minH: 260, maxH: 520, lit: 0, gap: 0 },
  { seed: 23, fill: "#0a2f22", minW: 80, maxW: 170, minH: 180, maxH: 430, lit: 0.22, gap: 4 },
  { seed: 37, fill: "#051a12", minW: 70, maxW: 150, minH: 120, maxH: 320, lit: 0.3, gap: 2 },
];
const WINDOW = ["#b6ff5c", "#3ddc97", "#d1f7e9"];

export function Skyline() {
  const r0 = rng(5);
  const stars = Array.from({ length: 110 }, () => ({
    x: Math.round(r0() * 1600),
    y: Math.round(r0() * 480),
    r: +(0.6 + r0() * 1.4).toFixed(1),
    o: +(0.35 + r0() * 0.65).toFixed(2),
  }));

  const layers = LAYERS.map((L) => {
    const r = rng(L.seed);
    const buildings: { x: number; y: number; w: number; h: number; windows: { x: number; y: number; c: string }[] }[] = [];
    let x = -40;
    while (x < 1640) {
      const w = Math.round(L.minW + r() * (L.maxW - L.minW));
      const h = Math.round(L.minH + r() * (L.maxH - L.minH));
      const windows: { x: number; y: number; c: string }[] = [];
      if (L.lit) {
        const cols = Math.floor((w - 20) / 18);
        const rows = Math.floor((h - 30) / 24);
        for (let cy = 0; cy < rows; cy++)
          for (let cx = 0; cx < cols; cx++)
            if (r() < L.lit) windows.push({ x: x + 12 + cx * 18, y: 900 - h + 18 + cy * 24, c: WINDOW[Math.floor(r() * WINDOW.length)] });
      }
      buildings.push({ x, y: 900 - h, w, h, windows });
      x += w + L.gap + Math.round(r() * 8);
    }
    return { L, buildings };
  });

  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#020b07" />
          <stop offset="0.5" stopColor="#06261a" />
          <stop offset="0.85" stopColor="#12734f" />
          <stop offset="1" stopColor="#3ddc97" />
        </linearGradient>
        <radialGradient id="moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#d1f7e9" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#3ddc97" stopOpacity="0.28" />
          <stop offset="1" stopColor="#3ddc97" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#b6ff5c" stopOpacity="0.55" />
          <stop offset="1" stopColor="#b6ff5c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#sky)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#d1f7e9" opacity={s.o} />
      ))}
      <circle cx="1230" cy="190" r="200" fill="url(#moon)" />
      <circle cx="1230" cy="190" r="44" fill="#eafff5" />
      <polygon points="330,640 200,0 470,0" fill="url(#beam)" opacity="0.5" />
      <polygon points="1010,660 1150,40 1290,40" fill="url(#beam)" opacity="0.35" />
      {layers.map(({ L, buildings }, li) => (
        <g key={li}>
          {buildings.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h + 2} fill={L.fill} />
          ))}
          {buildings.flatMap((b, i) =>
            b.windows.map((w, j) => <rect key={`${i}-${j}`} x={w.x} y={w.y} width="8" height="12" fill={w.c} opacity="0.85" />)
          )}
        </g>
      ))}
      <rect y="880" width="1600" height="20" fill="#030d09" />
    </svg>
  );
}
