"use client";

import { useEffect, useRef } from "react";
import styles from "./Lanyard.module.css";

type Point = { x: number; y: number; px: number; py: number };

// The strap: a chain of points from an anchor above the screen down to the
// badge's clip, simulated with verlet physics (each point remembers where it
// was, so its speed carries over), then drawn as a ribbon on a canvas.
const LINKS = 14;
const GRAVITY = 0.55;
const DAMPING = 0.985;
const ITERATIONS = 24;

/**
 * A badge on a lanyard that hangs from the top of the page. It drops in,
 * swings, and can be grabbed and flung; it turns in 3D as it moves.
 * `children` is the badge's face; Design Partner's strap has an iridescent stripe.
 */
export function Lanyard({
  children,
  partner = false,
  fill = false,
}: {
  children: React.ReactNode;
  partner?: boolean;
  /** Fill its column, full height, instead of spanning the page above the text. */
  fill?: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const badge = badgeRef.current;
    if (!stage || !canvas || !badge) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let link = 22;
    let badgeW = 0;
    let badgeH = 0;
    // From the clip at the top of the badge to its middle.
    let reach = 0;

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = stage.clientWidth;
      height = stage.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      badgeW = badge.offsetWidth;
      badgeH = badge.offsetHeight;
      reach = badgeH / 2 + 4;
      // Long enough that the badge hangs just above the stage's bottom edge;
      // filling a column, its middle hangs level with the text beside it.
      link = fill
        ? Math.max(14, (height * 0.52 - reach + 24) / LINKS)
        : Math.max(14, (height - badgeH - 12) / LINKS);
    };
    measure();

    const anchor = () => ({ x: width / 2, y: -24 });
    // Starts gathered up above the screen, so it drops in and swings.
    const rope: Point[] = Array.from({ length: LINKS + 1 }, (_, i) => {
      const a = anchor();
      const x = a.x + (reduced ? 0 : i * 6);
      const y = reduced ? a.y + i * link : a.y - i * 4;
      return { x, y, px: x, py: y };
    });
    const last = () => rope[rope.length - 1];
    const body: Point = (() => {
      const x = last().x + (reduced ? 0 : 60);
      const y = last().y + reach;
      return { x, y, px: x, py: y };
    })();

    let drag: { dx: number; dy: number; x: number; y: number } | null = null;

    // Keeps two points `length` apart, moving each by its share.
    const keep = (a: Point, b: Point, length: number, shareA: number) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.0001;
      const diff = (d - length) / d;
      a.x += dx * diff * shareA;
      a.y += dy * diff * shareA;
      b.x -= dx * diff * (1 - shareA);
      b.y -= dy * diff * (1 - shareA);
    };

    const step = () => {
      for (const p of [...rope.slice(1), body]) {
        const vx = (p.x - p.px) * DAMPING;
        const vy = (p.y - p.py) * DAMPING;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + GRAVITY;
      }
      if (drag) {
        body.x = drag.x - drag.dx;
        body.y = drag.y - drag.dy;
      }
      const a = anchor();
      for (let k = 0; k < ITERATIONS; k++) {
        rope[0].x = a.x;
        rope[0].y = a.y;
        for (let i = 0; i < LINKS; i++) keep(rope[i], rope[i + 1], link, i === 0 ? 0 : 0.5);
        // The badge is heavier than the strap; while held, it doesn't give at all.
        keep(last(), body, reach, drag ? 1 : 0.75);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const end = last();
      // The ribbon.
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(rope[0].x, rope[0].y);
      for (let i = 1; i < rope.length - 1; i++) {
        const mx = (rope[i].x + rope[i + 1].x) / 2;
        const my = (rope[i].y + rope[i + 1].y) / 2;
        ctx.quadraticCurveTo(rope[i].x, rope[i].y, mx, my);
      }
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = "#161616";
      ctx.lineWidth = 22;
      ctx.stroke();
      if (partner) {
        // An iridescent stripe down the middle.
        const sheen = ctx.createLinearGradient(0, 0, 0, height);
        sheen.addColorStop(0, "rgba(111,155,255,0.75)");
        sheen.addColorStop(0.35, "rgba(192,139,255,0.75)");
        sheen.addColorStop(0.7, "rgba(111,255,216,0.7)");
        sheen.addColorStop(1, "rgba(255,210,138,0.7)");
        ctx.strokeStyle = sheen;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // DESIGNJOY printed along the strap, every so often.
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "500 8px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let travelled = 0;
      let next = 40;
      for (let i = 0; i < rope.length - 1; i++) {
        const p = rope[i];
        const q = rope[i + 1];
        const seg = Math.hypot(q.x - p.x, q.y - p.y);
        while (travelled + seg >= next) {
          const t = (next - travelled) / seg;
          const x = p.x + (q.x - p.x) * t;
          const y = p.y + (q.y - p.y) * t;
          if (y > 0 && y < height) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.atan2(q.y - p.y, q.x - p.x));
            ctx.fillText("DESIGNJOY", 0, partner ? -5.5 : 0.5);
            ctx.restore();
          }
          next += 90;
        }
        travelled += seg;
      }

      // The badge hangs from the strap's end, turned to follow it, and swings
      // in 3D with its sideways speed.
      const angle = Math.atan2(body.y - end.y, body.x - end.x) - Math.PI / 2;
      const vx = body.x - body.px;
      const turn = Math.max(-40, Math.min(40, vx * 3.2));
      badge.style.transform = `translate(${body.x - badgeW / 2}px, ${body.y - badgeH / 2}px) rotate(${angle}rad) rotateY(${turn}deg)`;
      badge.style.setProperty("--turn", turn.toFixed(1));

      // The metal clip joining strap and badge.
      ctx.save();
      ctx.translate(end.x, end.y);
      ctx.rotate(angle);
      ctx.fillStyle = "#8a8a8a";
      ctx.strokeStyle = "#cfcfcf";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-9, -6, 18, 14, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    // Runs the physics at a steady 60 steps a second, whatever the screen's rate.
    let raf = 0;
    let lastTime = performance.now();
    let pending = 0;
    let settled = 0;
    const frame = (now: number) => {
      pending = Math.min(pending + (now - lastTime), 100);
      lastTime = now;
      while (pending >= 1000 / 60) {
        step();
        pending -= 1000 / 60;
      }
      draw();
      // Rests once it has stopped moving, until it's touched again.
      const moving = Math.abs(body.x - body.px) + Math.abs(body.y - body.py) > 0.02;
      settled = moving || drag ? 0 : settled + 1;
      if (settled < 30) raf = requestAnimationFrame(frame);
      else raf = 0;
    };
    const wake = () => {
      if (raf) return;
      lastTime = performance.now();
      settled = 0;
      raf = requestAnimationFrame(frame);
    };
    wake();

    const point = (event: PointerEvent) => {
      const box = stage.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };
    const down = (event: PointerEvent) => {
      const p = point(event);
      drag = { dx: p.x - body.x, dy: p.y - body.y, ...p };
      badge.setPointerCapture(event.pointerId);
      badge.dataset.grabbing = "";
      wake();
    };
    const move = (event: PointerEvent) => {
      if (!drag) return;
      Object.assign(drag, point(event));
    };
    const up = () => {
      drag = null;
      delete badge.dataset.grabbing;
    };
    badge.addEventListener("pointerdown", down);
    badge.addEventListener("pointermove", move);
    badge.addEventListener("pointerup", up);
    badge.addEventListener("pointercancel", up);

    const resize = new ResizeObserver(() => {
      measure();
      wake();
    });
    resize.observe(stage);

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      badge.removeEventListener("pointerdown", down);
      badge.removeEventListener("pointermove", move);
      badge.removeEventListener("pointerup", up);
      badge.removeEventListener("pointercancel", up);
    };
  }, [partner, fill]);

  return (
    <div ref={stageRef} className={fill ? `${styles.stage} ${styles.fill}` : styles.stage}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div ref={badgeRef} className={styles.badge}>
        {children}
      </div>
    </div>
  );
}
