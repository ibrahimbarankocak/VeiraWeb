// Animated run wallpaper: a scrolling city, lights, a road and a group of runners with a real run cycle.
// It is a night scene in dark mode and a sunny morning in light mode: every colour comes from the --sk-*
// CSS variables in app/globals.css, so the theme switch needs no JavaScript here.
// Pure SVG/CSS (no hooks). Deterministic (seeded PRNG) so server and client render identically.
// Keyframes live in app/globals.css (sk-* for the scenery, rn-* for the runners).

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const TILE = 1600; // width of one repeating tile, in scene units (the scene is 900 units tall)

type Layer = { seed: number; fillVar: string; minW: number; maxW: number; minH: number; maxH: number; lit: number; gap: number; extras: boolean };

const FAR: Layer = { seed: 11, fillVar: "--sk-far", minW: 90, maxW: 190, minH: 300, maxH: 540, lit: 0, gap: 0, extras: false };
const MID: Layer = { seed: 23, fillVar: "--sk-mid", minW: 80, maxW: 170, minH: 200, maxH: 450, lit: 0.2, gap: 5, extras: true };
const NEAR: Layer = { seed: 37, fillVar: "--sk-near", minW: 70, maxW: 150, minH: 130, maxH: 340, lit: 0.26, gap: 3, extras: true };

function Buildings({ L }: { L: Layer }) {
  const r = rng(L.seed);
  const body: React.ReactNode[] = [];
  const glass: React.ReactNode[] = [];
  let x = 0;
  let n = 0;
  while (x < TILE) {
    let w = Math.round(L.minW + r() * (L.maxW - L.minW));
    if (TILE - (x + w) < L.minW * 0.8) w = TILE - x; // last building ends exactly on the tile edge, so the loop is seamless
    const h = Math.round(L.minH + r() * (L.maxH - L.minH));
    const bw = w - L.gap;
    const top = 900 - h;
    body.push(<rect key={`b${n}`} x={x} y={top} width={bw} height={h + 2} />);
    if (L.extras) {
      if (r() < 0.3) body.push(<rect key={`s${n}`} x={x + 8} y={top - 18} width={Math.max(10, bw - 16)} height={20} />);
      if (r() < 0.28) body.push(<rect key={`a${n}`} x={x + bw / 2 - 2} y={top - 44} width={4} height={46} />);
    }
    if (L.lit) {
      const cols = Math.floor((bw - 20) / 18);
      const rows = Math.floor((h - 30) / 24);
      for (let cy = 0; cy < rows; cy++)
        for (let cx = 0; cx < cols; cx++)
          if (r() < L.lit) {
            const tone = Math.floor(r() * 3);
            const flicker = (cx * 7 + cy * 13 + n * 5) % 6 === 0;
            glass.push(
              <rect
                key={`w${n}-${cx}-${cy}`}
                className={`sk-w${tone}${flicker ? " sk-tw" : ""}`}
                style={flicker ? { animationDelay: `${((cx + cy * 3 + n) % 9) * -0.7}s` } : undefined}
                x={x + 11 + cx * 18}
                y={top + 18 + cy * 24}
                width={8}
                height={12}
                opacity={0.85}
              />
            );
          }
    }
    x += w;
    n++;
  }
  return (
    <>
      <g style={{ fill: `var(${L.fillVar})` }}>{body}</g>
      {glass}
    </>
  );
}

/** Three copies of a tile in one SVG that slides left by exactly one tile, forever (composited, no repaint). */
function ScrollLayer({ seconds, defs, children }: { seconds: number; defs?: React.ReactNode; children: React.ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${TILE * 3} 900`}
      aria-hidden
      className="absolute bottom-0 left-0 h-full will-change-transform"
      style={{ width: "auto", aspectRatio: `${TILE * 3} / 900`, animation: `sk-scroll ${seconds}s linear infinite` }}
    >
      {defs && <defs>{defs}</defs>}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * TILE} 0)`}>
          {children}
        </g>
      ))}
    </svg>
  );
}

function Clouds() {
  const r = rng(71);
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => {
        const cx = Math.round(60 + r() * 1480);
        const cy = Math.round(90 + r() * 300);
        const s = 0.7 + r() * 0.9;
        return (
          <g key={i} style={{ fill: "var(--sk-cloud)", opacity: "var(--sk-cloud-op)" }}>
            <ellipse cx={cx} cy={cy} rx={150 * s} ry={13 * s} />
            <ellipse cx={cx + 60 * s} cy={cy - 12 * s} rx={95 * s} ry={11 * s} />
            <ellipse cx={cx - 70 * s} cy={cy + 10 * s} rx={110 * s} ry={9 * s} />
          </g>
        );
      })}
    </>
  );
}

function Lamps() {
  return (
    <>
      {[230, 760, 1290].map((x) => (
        <g key={x}>
          <circle cx={x + 34} cy={655} r={75} fill="url(#lampGlow)" style={{ opacity: "var(--sk-lamp-op)" }} />
          <rect x={x - 3} y={650} width={6} height={160} fill="#0a1a14" />
          <path d={`M${x} 652 Q${x + 4} 636 ${x + 34} 640`} fill="none" stroke="#0a1a14" strokeWidth={5} strokeLinecap="round" />
          <rect x={x + 26} y={638} width={18} height={7} rx={3} fill="#dfe9a8" />
        </g>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------------------------
// The runners. Side view, facing right, hip joint at (0,0), y pointing down. Limbs are tapered
// shapes (thigh, calf with a muscle bulge, forearm...) that rotate around their joints; the CSS
// keyframes rn-* drive the stride. Positive rotation swings a limb backwards, negative forwards.
// ---------------------------------------------------------------------------------------------
export type Look = {
  skin: string;
  hair: string;
  top: string;
  shorts: string;
  trim: string; // shorts stripe, headband, shoe accent
  shoe: string;
  ponytail?: boolean;
  headband?: boolean;
};

function Runner({ x, y, s, look, base }: { x: number; y: number; s: number; look: Look; base: number }) {
  const d = (t: number) => ({ animationDelay: `${t + base}s` });
  const { skin, hair, top, shorts, trim, shoe } = look;
  const shade = (path: string, on: boolean) => (on ? <path d={path} fill="#000" opacity={0.3} /> : null);

  const UPPER_ARM = "M-3.4 -1 C-4.5 4 -3.9 10 -2.7 15 L2.5 15 C3.3 10 3.9 4 3.4 -1 Z";
  const FOREARM = "M-2.7 0 C-3.2 5 -2.6 10 -1.9 13.5 L1.9 13.5 C2.6 10 3.1 5 2.7 0 Z";
  const THIGH = "M-6.8 0 C-7.6 9 -6 19 -4.7 27 L4.5 27 C5.4 19 7 9 6.6 0 Z";
  const SHORTS_LEG = "M-8 -3 L7.8 -3 C8.8 5 9.6 11 10 16.6 C4 18.4 -3 18.4 -9.2 16.6 C-8.6 10 -8.6 4 -8 -3 Z";
  const CALF = "M-4.4 0 C-7.7 6 -6.3 14 -3.2 22 L2.9 22 C3.5 14 4.7 6 4.4 0 Z";
  const SOCK = "M-3.5 14 L3.3 14 L2.9 22 L-3.2 22 Z";
  const SHOE = "M-4.3 -1 L3 -1 C4 3 8.6 4 12.4 6.2 C13.8 7 13.6 9.2 11.8 9.6 L-5.5 9.6 C-6.3 6.5 -5.5 2 -4.3 -1 Z";
  const SOLE = "M-5.7 8 L12.6 8 L12.4 10.6 L-5.9 10.6 Z";

  const arm = (delay: number, far: boolean) => (
    <g transform="translate(4 -37)">
      <g className="rn-arm" style={d(delay)}>
        <circle r={4.2} fill={skin} />
        <path d={UPPER_ARM} fill={skin} />
        {shade(UPPER_ARM, far)}
        {far && <circle r={4.2} fill="#000" opacity={0.3} />}
        <g transform="translate(0 14.5)">
          <g className="rn-fore" style={d(delay)}>
            <path d={FOREARM} fill={skin} />
            <rect x={-2.3} y={10.6} width={4.6} height={2} rx={0.8} fill="#1d2a26" />
            <ellipse cx={0} cy={15.2} rx={3.1} ry={3.6} fill={skin} />
            {shade(FOREARM, far)}
            {far && <ellipse cx={0} cy={15.2} rx={3.1} ry={3.6} fill="#000" opacity={0.3} />}
          </g>
        </g>
        <circle cy={14.5} r={3} fill={skin} />
        {far && <circle cy={14.5} r={3} fill="#000" opacity={0.3} />}
      </g>
    </g>
  );

  const leg = (delay: number, far: boolean) => (
    <g>
      <g className="rn-thigh" style={d(delay)}>
        <path d={THIGH} fill={skin} />
        <path d={SHORTS_LEG} fill={shorts} />
        <path d="M7.9 -2 L8.9 15.5" stroke={trim} strokeWidth={1.4} fill="none" />
        {shade(THIGH, far)}
        {far && <path d={SHORTS_LEG} fill="#000" opacity={0.3} />}
        <g transform="translate(0 27)">
          <g className="rn-shin" style={d(delay)}>
            <path d={CALF} fill={skin} />
            <path d={SOCK} fill="#f4f7f5" />
            {shade(CALF, far)}
            <g transform="translate(0 22)">
              <g className="rn-foot" style={d(delay)}>
                <path d={SHOE} fill={shoe} />
                <path d="M-1 1 L6 3.4" stroke={trim} strokeWidth={1.3} strokeLinecap="round" fill="none" />
                <path d={SOLE} fill="#f4f7f5" />
                {far && <path d={SHOE} fill="#000" opacity={0.3} />}
              </g>
            </g>
          </g>
        </g>
        <circle cy={27} r={4.8} fill={skin} />
        {far && <circle cy={27} r={4.8} fill="#000" opacity={0.3} />}
      </g>
    </g>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={3} cy={58.6} rx={31} ry={3.6} fill="#000" style={{ opacity: "var(--sk-shadow)" }} />
      <g className="rn-bob" style={d(0)}>
        {leg(-0.36, true)}
        <g className="rn-torso" style={d(0)}>
          {arm(0, true)}
          {/* torso: tank top */}
          <path d="M-5.6 3 C-6.4 -8 -5 -22 -1.2 -36 C0.6 -41.5 6.4 -43.5 10 -39 C12.4 -35 12.2 -24 9.6 -12 C8.8 -7 8.6 -2 8.4 3 Z" fill={top} />
          <path d="M-5.6 3 C-6.4 -8 -5 -22 -1.2 -36 C-0.4 -38 0.6 -39.6 2 -40.6 C-1 -30 -1.6 -14 -1 3 Z" fill="#000" opacity={0.14} />
          <path d="M5.2 -30.6 L10.4 -31 L10.8 -23 L5.6 -22.6 Z" fill="#f4f7f5" opacity={0.92} />
          {/* neck and head */}
          <path d="M2.4 -44.5 L6.8 -44.5 L7.4 -38.5 L2.6 -38.5 Z" fill={skin} />
          <g transform="translate(0 2.8)">
          <g className="rn-head" style={d(0)}>
            <ellipse cx={8.4} cy={-52.6} rx={6.4} ry={7.6} fill={skin} />
            <path d="M14.4 -52.4 L16.6 -50.4 L14.4 -49.4 Z" fill={skin} />
            <ellipse cx={6.3} cy={-52} rx={1.5} ry={2.2} fill="#000" opacity={0.14} />
            <path d="M2.4 -52.4 C1.2 -61 9 -62.6 13.8 -58.6 C11.6 -58.2 9.2 -57.2 7.4 -54.2 C5.6 -53.6 3.8 -53.2 2.4 -52.4 Z" fill={hair} />
            {look.headband && <path d="M2.6 -55.2 C5 -56.8 10 -57.2 14.4 -56 L14.2 -53.8 C10 -55 5 -54.6 2.4 -53.2 Z" fill={trim} />}
            <circle cx={12.2} cy={-54} r={0.9} fill="#1d1712" />
            <path d="M10.6 -56.1 L13.4 -56.5" stroke={hair} strokeWidth={0.7} strokeLinecap="round" />
            <path d="M12.6 -47.6 L14.4 -47.9" stroke="#000" strokeOpacity={0.35} strokeWidth={0.8} strokeLinecap="round" />
            {look.ponytail && (
              <g transform="translate(2.6 -56)">
                <g className="rn-pony" style={d(0)}>
                  <path d="M0 0 C-7 -1 -10 8 -6 16 C-6.4 9 -3.4 3.4 1.6 1.4 Z" fill={hair} />
                </g>
              </g>
            )}
          </g>
          </g>
          {/* waistband and near arm */}
          <path d="M-6.4 -2 L9 -2 L9.3 6 L-6.8 6 Z" fill={shorts} />
          {arm(-0.36, false)}
        </g>
        {leg(0, false)}
      </g>
    </g>
  );
}

const LOOKS: Look[] = [
  // white sports top, ponytail
  { skin: "#f0c09a", hair: "#5c3418", top: "#12b98a", shorts: "#1c2f5e", trim: "#ffffff", shoe: "#ffffff", ponytail: true, headband: true },
  // front runner
  { skin: "#d9a276", hair: "#2a1a10", top: "#ff5b4d", shorts: "#15252e", trim: "#b6ff5c", shoe: "#b6ff5c" },
  // third runner
  { skin: "#8d5b3d", hair: "#171212", top: "#3b6cf5", shorts: "#e8eeeb", trim: "#3b6cf5", shoe: "#ff7a45" },
];

/** Exported so the runners can be inspected on their own. */
export function RunnersSvg({ className = "h-full w-full overflow-visible" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 128" className={className}>
      <Runner x={64} y={66} s={0.96} look={LOOKS[0]} base={-0.2} />
      <Runner x={236} y={66} s={0.92} look={LOOKS[2]} base={-0.5} />
      <Runner x={150} y={66} s={1.05} look={LOOKS[1]} base={0} />
    </svg>
  );
}

const SUN = { x: 1230, y: 215 };

export function RunScene() {
  const r = rng(5);
  const stars = Array.from({ length: 100 }, (_, i) => ({
    x: Math.round(r() * 1600),
    y: Math.round(r() * 470),
    r: +(0.6 + r() * 1.4).toFixed(1),
    o: +(0.35 + r() * 0.65).toFixed(2),
    tw: i % 4 === 0,
    dl: -(r() * 6).toFixed(1),
  }));

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "var(--sk-sky)" }} aria-hidden>
      {/* Sky: stars and moon at night, sun and rays by day */}
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#d1f7e9" stopOpacity="0.9" />
            <stop offset="0.35" stopColor="#3ddc97" stopOpacity="0.28" />
            <stop offset="1" stopColor="#3ddc97" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fffbe6" stopOpacity="1" />
            <stop offset="0.25" stopColor="#ffe9a3" stopOpacity="0.75" />
            <stop offset="0.6" stopColor="#ffd27a" stopOpacity="0.28" />
            <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ray" x1="0" y1="0" x2="0" y2="-1">
            <stop offset="0" stopColor="#fff6c8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff6c8" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g className="sk-fade" style={{ opacity: "var(--sk-night)" }}>
          {stars.map((s, i) => (
            <circle
              key={i}
              className={s.tw ? "sk-tw" : undefined}
              style={s.tw ? { animationDelay: `${s.dl}s` } : undefined}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#d1f7e9"
              opacity={s.o}
            />
          ))}
          <circle cx={1230} cy={190} r={210} fill="url(#moonGlow)" />
          <circle cx={1230} cy={190} r={44} fill="#eafff5" />
        </g>

        <g className="sk-fade" style={{ opacity: "var(--sk-day)" }} transform={`translate(${SUN.x} ${SUN.y})`}>
          <g className="sk-spin">
            {Array.from({ length: 14 }, (_, i) => (
              <path key={i} d="M0 0 L-46 -1500 L46 -1500 Z" fill="url(#ray)" transform={`rotate(${i * (360 / 14)})`} />
            ))}
          </g>
          <circle r={330} fill="url(#sunGlow)" />
          <circle r={62} fill="#fffdf0" />
        </g>
      </svg>

      <ScrollLayer seconds={320}>
        <Clouds />
      </ScrollLayer>

      {/* Searchlights sweeping the night sky */}
      <div className="sk-fade" style={{ opacity: "var(--sk-night)" }}>
        <div
          className="sk-sweep absolute bottom-[26%] left-[16%] h-[78%] w-[16%] origin-bottom [clip-path:polygon(46%_100%,54%_100%,100%_0,0_0)]"
          style={{ background: "linear-gradient(to top, var(--sk-beam), transparent)" }}
        />
        <div
          className="sk-sweep absolute bottom-[26%] left-[66%] h-[70%] w-[14%] origin-bottom [clip-path:polygon(46%_100%,54%_100%,100%_0,0_0)]"
          style={{ background: "linear-gradient(to top, var(--sk-beam), transparent)", animationDelay: "-5s", animationDuration: "13s" }}
        />
      </div>

      {/* City, far to near, each sliding at its own speed */}
      <ScrollLayer seconds={260}>
        <Buildings L={FAR} />
      </ScrollLayer>
      <ScrollLayer seconds={140}>
        <Buildings L={MID} />
      </ScrollLayer>
      <ScrollLayer seconds={76}>
        <Buildings L={NEAR} />
      </ScrollLayer>
      <ScrollLayer
        seconds={30}
        defs={
          <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#eaffb0" stopOpacity="0.5" />
            <stop offset="1" stopColor="#b6ff5c" stopOpacity="0" />
          </radialGradient>
        }
      >
        <Lamps />
      </ScrollLayer>

      {/* Road with moving lane markings */}
      <div
        className="absolute inset-x-0 bottom-0 h-[12.5%] overflow-hidden"
        style={{ background: "linear-gradient(to bottom, var(--sk-road-a), var(--sk-road-b))" }}
      >
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "var(--sk-road-edge)", boxShadow: "0 0 18px var(--sk-road-edge)" }} />
        <div
          className="absolute left-0 top-[52%] h-[5px] w-[200%] will-change-transform"
          style={{
            background: "repeating-linear-gradient(90deg, var(--sk-lane) 0 70px, transparent 70px 170px)",
            animation: "sk-lane 1.1s linear infinite",
          }}
        />
      </div>

      {/* The runners */}
      <div className="absolute bottom-[3%] left-1/2 aspect-[300/128] h-[25%] -translate-x-1/2">
        <RunnersSvg />
      </div>
    </div>
  );
}
