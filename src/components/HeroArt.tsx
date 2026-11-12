// Original hairline isometric illustration for the Home hero:
// a big wireframe cube (like the logo) with smaller cubes stepping out of it,
// one for each "dimension". The lines draw themselves in once on load.

const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;

type P = [number, number, number];

function iso([x, y, z]: P): [number, number] {
  return [(x - y) * COS, (x + y) * SIN - z];
}

/** Path for the 12 edges of a box at (x,y,z) with size (w,d,h). Hidden edges are dashed separately. */
function box(x: number, y: number, z: number, w: number, d: number, h: number) {
  const c = (dx: number, dy: number, dz: number) => iso([x + dx, y + dy, z + dz]);
  const seg = (a: [number, number], b: [number, number]) =>
    `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  const visible = [
    // top face
    seg(c(0, 0, h), c(w, 0, h)),
    seg(c(w, 0, h), c(w, d, h)),
    seg(c(w, d, h), c(0, d, h)),
    seg(c(0, d, h), c(0, 0, h)),
    // front vertical edges
    seg(c(w, 0, 0), c(w, 0, h)),
    seg(c(w, d, 0), c(w, d, h)),
    seg(c(0, d, 0), c(0, d, h)),
    // bottom front edges
    seg(c(w, 0, 0), c(w, d, 0)),
    seg(c(w, d, 0), c(0, d, 0)),
  ].join("");
  const hidden = [
    seg(c(0, 0, 0), c(w, 0, 0)),
    seg(c(0, 0, 0), c(0, d, 0)),
    seg(c(0, 0, 0), c(0, 0, h)),
  ].join("");
  return { visible, hidden };
}

const BIG = box(0, 0, 0, 120, 120, 120);
const SMALL = [
  { b: box(150, 10, 0, 34, 34, 34), accent: true, delay: 0.5 },
  { b: box(10, 150, 0, 34, 34, 34), accent: false, delay: 0.65 },
  { b: box(40, 40, 150, 34, 34, 34), accent: false, delay: 0.8 },
  { b: box(150, 150, 0, 22, 22, 22), accent: false, delay: 0.95 },
];

// Floor grid lines under the scene.
const GRID = Array.from({ length: 7 }, (_, i) => {
  const t = -30 + i * 40;
  const a1 = iso([t, -30, 0]);
  const b1 = iso([t, 210, 0]);
  const a2 = iso([-30, t, 0]);
  const b2 = iso([210, t, 0]);
  return `M${a1[0]} ${a1[1]}L${b1[0]} ${b1[1]}M${a2[0]} ${a2[1]}L${b2[0]} ${b2[1]}`;
}).join("");

export function HeroArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-200 -230 400 360"
      fill="none"
      aria-hidden="true"
      className={className}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={GRID} stroke="white" strokeOpacity="0.06" strokeWidth="1" />
      <path className="hero-draw" d={BIG.hidden} stroke="white" strokeOpacity="0.18" strokeWidth="1.2" strokeDasharray="3 5" />
      <path className="hero-draw" d={BIG.visible} stroke="white" strokeOpacity="0.7" strokeWidth="1.4" pathLength={1} />
      {SMALL.map(({ b, accent, delay }, i) => (
        <g key={i}>
          <path
            className="hero-draw"
            style={{ animationDelay: `${delay}s` }}
            d={b.hidden}
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <path
            className="hero-draw"
            style={{ animationDelay: `${delay}s` }}
            d={b.visible}
            stroke={accent ? "var(--color-powder)" : "white"}
            strokeOpacity={accent ? 1 : 0.55}
            strokeWidth="1.3"
            pathLength={1}
          />
        </g>
      ))}
    </svg>
  );
}
