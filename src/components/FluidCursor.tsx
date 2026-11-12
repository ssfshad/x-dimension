import { useEffect, useRef } from "react";

export type FluidVariant = "glossy" | "ink";

const N = 14;

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
#define N ${N}
uniform vec3 u_p[N];
uniform float u_mode;
uniform vec3 u_color;

void main() {
  vec2 p = gl_FragCoord.xy;
  float f = 0.0;
  vec2 g = vec2(0.0);
  for (int i = 0; i < N; i++) {
    vec3 b = u_p[i];
    vec2 d = p - b.xy;
    float d2 = dot(d, d) + 1.0;
    float w = b.z * b.z / d2;
    f += w;
    g += (-2.0 * w / d2) * d;
  }

  float gl = max(length(g), 1e-5);
  float a = clamp((f - 1.0) / (gl * 1.5), 0.0, 1.0);
  if (a <= 0.0) { gl_FragColor = vec4(0.0); return; }

  float k = 1.5 * exp(-(f - 1.0) * 1.5);
  vec3 n = normalize(vec3(-g * k * 18.0, 1.0));

  vec3 L = normalize(vec3(-0.4, 0.7, 0.6));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, H), 0.0), 60.0);
  float rim = pow(1.0 - n.z, 2.5);
  float diff = max(dot(n, L), 0.0);

  // Powder blue liquid (#B0E0E6) with a soft highlight.
  vec3 glossy = u_color * (0.55 + 0.45 * diff) + vec3(1.0) * spec * 0.55 + vec3(1.0) * rim * 0.1;
  vec3 ink = vec3(0.03) + vec3(1.0) * spec * 0.22 + vec3(0.05) * rim;
  vec3 col = mix(glossy, ink, u_mode);

  gl_FragColor = vec4(col * a, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("FluidCursor shader error:", gl.getShaderInfoLog(s));
  }
  return s;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [0.69, 0.878, 0.902];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function FluidCursor({
  variant = "glossy",
  color = "#b0e0e6",
}: {
  variant?: FluidVariant;
  color?: string;
}) {
  const colorRef = useRef(hexToRgb(color));
  colorRef.current = hexToRgb(color);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const variantRef = useRef(variant);
  variantRef.current = variant;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uP = gl.getUniformLocation(prog, "u_p");
    const uMode = gl.getUniformLocation(prog, "u_mode");
    const uColor = gl.getUniformLocation(prog, "u_color");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    // Simulation state, in CSS pixels.
    const px = new Float32Array(N);
    const py = new Float32Array(N);
    const data = new Float32Array(N * 3);
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let started = false;
    let visible = 0; // eased 0..1
    let visibleTarget = 0;
    let hover = 1; // eased size multiplier over interactive elements
    let hoverTarget = 1;
    let stretch = 1;
    let lastX = tx;
    let lastY = ty;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!started) {
        started = true;
        px.fill(tx);
        py.fill(ty);
        lastX = tx;
        lastY = ty;
      }
      visibleTarget = 1;
      const el = e.target as Element | null;
      hoverTarget = el?.closest?.("a,button,[data-fluid]") ? 1.14 : 1;
    };
    const onHide = () => { visibleTarget = 0; };
    const onUp = (e: PointerEvent) => { if (e.pointerType !== "mouse") visibleTarget = 0; };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onHide, { passive: true });
    document.documentElement.addEventListener("pointerleave", onHide);
    window.addEventListener("blur", onHide);
    window.addEventListener("resize", resize);
    document.documentElement.classList.add("fluid-cursor-on");

    let raf = 0;
    let prev = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      const step = dt * 60;
      const ease = (k: number) => 1 - Math.pow(1 - k, step);

      visible += (visibleTarget - visible) * ease(0.14);
      hover += (hoverTarget - hover) * ease(0.12);

      // Head chases the pointer; each droplet chases the one before it.
      px[0] += (tx - px[0]) * ease(0.55);
      py[0] += (ty - py[0]) * ease(0.55);
      for (let i = 1; i < N; i++) {
        const k = 0.42 - (i / N) * 0.24;
        px[i] += (px[i - 1] - px[i]) * ease(k);
        py[i] += (py[i - 1] - py[i]) * ease(k);
      }

      const speed = Math.hypot(px[0] - lastX, py[0] - lastY) / Math.max(step, 0.001);
      lastX = px[0];
      lastY = py[0];
      const stretchTarget = 1 + Math.min(speed / 14, 1.5);
      stretch += (stretchTarget - stretch) * ease(stretchTarget > stretch ? 0.3 : 0.07);

      gl.disable(gl.SCISSOR_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (visible < 0.01) return;

      const t = now / 1000;
      const h = canvas.height;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const wob = 2.6 * (0.4 + u);
        const ox = Math.sin(t * 1.7 + i * 1.9) * wob;
        const oy = Math.cos(t * 1.3 + i * 2.3) * wob;
        const r = (4.8 - 2.8 * u) * stretch * hover * visible * dpr;
        const x = (px[i] + ox) * dpr;
        const y = h - (py[i] + oy) * dpr;
        data[i * 3] = x;
        data[i * 3 + 1] = y;
        data[i * 3 + 2] = r;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }

      // Only shade the area around the blob.
      const pad = 90 * dpr * hover;
      const sx = Math.max(0, Math.floor(minX - pad));
      const sy = Math.max(0, Math.floor(minY - pad));
      const sw = Math.min(canvas.width, Math.ceil(maxX + pad)) - sx;
      const sh = Math.min(canvas.height, Math.ceil(maxY + pad)) - sy;
      if (sw <= 0 || sh <= 0) return;
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(sx, sy, sw, sh);

      gl.uniform3fv(uP, data);
      gl.uniform3fv(uColor, colorRef.current);
      gl.uniform1f(uMode, variantRef.current === "ink" ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onHide);
      document.documentElement.removeEventListener("pointerleave", onHide);
      window.removeEventListener("blur", onHide);
      window.removeEventListener("resize", resize);
      document.documentElement.classList.remove("fluid-cursor-on");
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] h-full w-full"
    />
  );
}
