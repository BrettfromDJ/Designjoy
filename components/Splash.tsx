"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { INTRO_SEEN_KEY as SEEN_KEY } from "@/lib/intro";
import styles from "./Splash.module.css";

// The Designjoy smile, from public/icons/smile.svg (30 × 11 units).
const SMILE =
  "M24.562 0.0428649C25.5492 0.2591 26.1738 1.23273 25.957 2.21754C24.8517 7.23956 20.3689 11 15 11C9.63118 11 5.14834 7.23997 4.04296 2.2175C3.82622 1.2327 4.4508 0.259075 5.438 0.042858C6.42519 -0.173359 7.40118 0.449705 7.61792 1.43451C8.36259 4.81805 11.3868 7.34876 15 7.34876C18.6131 7.34876 21.6374 4.81775 22.3821 1.43448C22.5988 0.449677 23.5748 -0.17337 24.562 0.0428649Z";

/** The canvas is drawn at 2x and is much bigger than the smile, so nothing it draws ever reaches its edges. */
const W = 640;
const H = 400;
const SCALE = 6; // the smile shows about 66px wide
const GLITCH_MS = 700;
const HOLD_MS = 250;
const FADE_MS = 350;

function seen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage blocked: the intro just plays again next time.
  }
}

function drawLogo(color: string, glow: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(W / 2 - 15 * SCALE, H / 2 - 5.5 * SCALE);
  ctx.scale(SCALE, SCALE);
  if (glow) {
    ctx.shadowColor = "rgba(255, 255, 255, 0.35)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 3;
  }
  ctx.fillStyle = color;
  ctx.fill(new Path2D(SMILE));
  return canvas;
}

/**
 * A quick monochrome glitch of the smile over a black screen, shown once
 * per browser session on the homepage, then it fades to reveal the site.
 */
export function Splash() {
  // Rendered on the server so the site never flashes before the intro.
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Before the first paint: skip it if it's been seen, or for reduced motion.
  useLayoutEffect(() => {
    if (seen() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) setShow(false);
  }, []);

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    markSeen();

    const logo = drawLogo("#fff", true);
    // Torn frames skip the glow, so strips never show a cut-off halo.
    const bare = drawLogo("#fff", false);
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const top = H / 2 - 5.5 * SCALE - 8;
    const bottom = H / 2 + 5.5 * SCALE + 8;

    const frame = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      if (t > 0.7) {
        ctx.drawImage(logo, 0, 0);
        return;
      }
      // Now and then, drop a frame entirely.
      if (Math.random() < 0.2) return;
      const k = 1 - t;
      for (let y = top; y < bottom; ) {
        const h = Math.ceil(rnd(3, 16));
        const dx = Math.random() < 0.35 ? rnd(-26, 26) * k : 0;
        ctx.drawImage(bare, 0, y, W, h, dx, y, W, h);
        y += h;
      }
      if (Math.random() < 0.4) {
        ctx.globalAlpha = 0.45;
        ctx.drawImage(bare, rnd(-8, 8) * k, 0);
        ctx.globalAlpha = 1;
      }
    };

    let raf = 0;
    let last = 0;
    const timers: number[] = [];
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / GLITCH_MS);
      // Glitches read better at a choppy ~24fps than a smooth 60.
      if (now - last > 40 || t === 1) {
        frame(t);
        last = now;
      }
      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      timers.push(window.setTimeout(() => setLeaving(true), HOLD_MS));
      timers.push(window.setTimeout(() => setShow(false), HOLD_MS + FADE_MS));
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className={styles.splash}
      data-leaving={leaving || undefined}
      style={{ "--fade": `${FADE_MS}ms` } as React.CSSProperties}
      aria-hidden="true"
      onClick={() => setShow(false)}
    >
      <canvas ref={canvasRef} width={W} height={H} className={styles.canvas} />
    </div>
  );
}
