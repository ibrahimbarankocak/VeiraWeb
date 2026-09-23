// Animated night-run wallpaper: a scrolling city, twinkling lights, sweeping searchlights, lamp posts,
// a moving road and a group of runners with a real run cycle.
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
const WINDOW_COLORS = ["#b6ff5c", "#3ddc97", "#d1f7e9"];

type Layer = { seed: number; fill: string; minW: number; maxW: number; minH: number; maxH: number; lit: number; gap: number; extras: boolean };

const FAR: Layer = { seed: 11, fill: "#0f4a35", minW: 90, maxW: 190, minH: 300, maxH: 540, lit: 0, gap: 0, extras: false };
const MID: Layer = { seed: 23, fill: "#0a2f22", minW: 80, maxW: 170, minH: 200, maxH: 450, lit: 0.2, gap: 5, extras: true };
const NEAR: Layer = { seed: 37, fill: "#051a12", minW: 70, maxW: 150, minH: 130, maxH: 340, lit: 0.26, gap: 3, extras: true };

function Buildings({ L }: { L: Layer }) {
  const r = rng(L.seed);
  const els: React.ReactNode[] = [];
  let x = 0;
  let n = 0;
  while (x < TILE) {
    let w = Math.round(L.minW + r() * (L.maxW - L.minW));
    if (TILE - (x + w) < L.minW * 0.8) w = TILE - x; // last building ends exactly on the tile edge, so the loop is seamless
    const h = Math.round(L.minH + r() * (L.maxH - L.minH));
    const bw = w - L.gap;
    const top = 900 - h;
    els.push(<rect key={`b${n}`} x={x} y={top} width={bw} height={h + 2} fill={L.fill} />);
    if (L.extras) {
      if (r() < 0.3) els.push(<rect key={`s${n}`} x={x + 8} y={top - 18} width={Math.max(10, bw - 16)} height={20} fill={L.fill} />);
      if (r() < 0.28) els.push(<rect key={`a${n}`} x={x + bw / 2 - 2} y={top - 44} width={4} height={46} fill={L.fill} />);
    }
    if (L.lit) {
      const cols = Math.floor((bw - 20) / 18);
      const rows = Math.floor((h - 30) / 24);
      for (let cy = 0; cy < rows; cy++)
        for (let cx = 0; cx < cols; cx++)
          if (r() < L.lit) {
            const c = WINDOW_COLORS[Math.floor(r() * WINDOW_COLORS.length)];
            const flicker = (cx * 7 + cy * 13 + n * 5) % 6 === 0;
            els.push(
              <rect
                key={`w${n}-${cx}-${cy}`}
                className={flicker ? "sk-tw" : undefined}
                style={flicker ? { animationDelay: `${((cx + cy * 3 + n) % 9) * -0.7}s` } : undefined}
                x={x + 11 + cx * 18}
                y={top + 18 + cy * 24}
                width={8}
                height={12}
                fill={c}
                opacity={0.85}
              />
            );
          }
    }
    x += w;
    n++;
  }
  return <>{els}</>;
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
          <g key={i} opacity={0.09} fill="#d1f7e9">
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
          <circle cx={x + 34} cy={655} r={75} fill="url(#lampGlow)" />
          <rect x={x - 3} y={650} width={6} height={160} fill="#020a07" />
          <path d={`M${x} 652 Q${x + 4} 636 ${x + 34} 640`} fill="none" stroke="#020a07" strokeWidth={5} strokeLinecap="round" />
          <rect x={x + 26} y={638} width={18} height={7} rx={3} fill="#eaffb0" />
        </g>
      ))}
    </>
  );
}

function Runner({ x, y, s, color, base }: { x: number; y: number; s: number; color: string; base: number }) {
  const d = (t: number) => ({ animationDelay: `${t + base}s` });
  const far = 0.55;
  const arm = (delay: number, opacity: number) => (
    <g transform="translate(5 -38)" opacity={opacity}>
      <g className="rn-arm" style={d(delay)}>
        <path d="M0 0V15" strokeWidth={6} />
        <g transform="translate(0 15)">
          <g className="rn-fore" style={d(delay)}>
            <path d="M0 0V13" strokeWidth={5} />
          </g>
        </g>
      </g>
    </g>
  );
  const leg = (delay: number, opacity: number) => (
    <g opacity={opacity}>
      <g className="rn-thigh" style={d(delay)}>
        <path d="M0 0V26" strokeWidth={9} />
        <g transform="translate(0 26)">
          <g className="rn-shin" style={d(delay)}>
            <path d="M0 0V26" strokeWidth={7} />
            <path d="M0 26L11 27" strokeWidth={6} />
          </g>
        </g>
      </g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeLinecap="round" fill="none">
      <ellipse cx={4} cy={54} rx={30} ry={4} fill="#000" stroke="none" opacity={0.35} />
      <g className="rn-bob" style={d(0)}>
        {arm(0, far)}
        {leg(-0.36, far)}
        <path d="M0 2L7 -38" strokeWidth={12} />
        <circle cx={12} cy={-52} r={7.5} fill={color} stroke="none" />
        {leg(0, 1)}
        {arm(-0.36, 1)}
      </g>
    </g>
  );
}

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
    <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(to_bottom,#020b07_0%,#06261a_42%,#0f6a49_76%,#3ddc97_100%)]" aria-hidden>
      {/* Stars and moon */}
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#d1f7e9" stopOpacity="0.9" />
            <stop offset="0.35" stopColor="#3ddc97" stopOpacity="0.28" />
            <stop offset="1" stopColor="#3ddc97" stopOpacity="0" />
          </radialGradient>
        </defs>
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
      </svg>

      <ScrollLayer seconds={320}>
        <Clouds />
      </ScrollLayer>

      {/* Searchlights sweeping the sky */}
      <div className="sk-sweep absolute bottom-[26%] left-[16%] h-[78%] w-[16%] origin-bottom bg-gradient-to-t from-[#b6ff5c]/45 to-transparent [clip-path:polygon(46%_100%,54%_100%,100%_0,0_0)]" />
      <div
        className="sk-sweep absolute bottom-[26%] left-[66%] h-[70%] w-[14%] origin-bottom bg-gradient-to-t from-[#b6ff5c]/35 to-transparent [clip-path:polygon(46%_100%,54%_100%,100%_0,0_0)]"
        style={{ animationDelay: "-5s", animationDuration: "13s" }}
      />

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
      <div className="absolute inset-x-0 bottom-0 h-[12.5%] overflow-hidden bg-gradient-to-b from-[#0b241a] to-[#020a07]">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[#3ddc97]/60 shadow-[0_0_18px_#3ddc97]" />
        <div
          className="absolute left-0 top-[52%] h-[5px] w-[200%] will-change-transform"
          style={{
            background: "repeating-linear-gradient(90deg,#d1f7e9 0 70px,transparent 70px 170px)",
            animation: "sk-lane 1.1s linear infinite",
          }}
        />
      </div>

      {/* The runners */}
      <div className="absolute bottom-[3%] left-1/2 aspect-[300/120] h-[23%] -translate-x-1/2">
        <svg viewBox="0 0 300 120" className="h-full w-full overflow-visible">
          <Runner x={62} y={62} s={0.96} color="#d1f7e9" base={-0.2} />
          <Runner x={232} y={62} s={0.92} color="#3ddc97" base={-0.5} />
          <Runner x={150} y={62} s={1.06} color="#b6ff5c" base={0} />
        </svg>
      </div>
    </div>
  );
}
