"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CyclesDemo.module.css";

// The demo is laid out at a fixed size and scaled to fit its container.
const W = 320;
const H = 240;
const FRAME_MS = 700;

// The story, on a loop: images are dragged in, play as frames, then one
// click on Download GIF makes and saves it.
type Phase = "empty" | "drag" | "drop" | "play" | "aim" | "making" | "done" | "out";
const TIMELINE: [Phase, number][] = [
  ["empty", 0],
  ["drag", 700],
  ["drop", 1800],
  ["play", 2200],
  ["aim", 5000],
  ["making", 5800],
  ["done", 6900],
  ["out", 9000],
];
const LOOP_MS = 9600;

// Where the pointer is in each phase.
const CURSOR: Record<Phase, [number, number]> = {
  empty: [70, 270],
  drag: [104, 96],
  drop: [104, 96],
  play: [160, 150],
  aim: [298, 222],
  making: [298, 222],
  done: [298, 222],
  out: [350, 270],
};

const ORDER = TIMELINE.map(([phase]) => phase);
const atLeast = (phase: Phase, than: Phase) => ORDER.indexOf(phase) >= ORDER.indexOf(than);

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A small working replica of the Cycles tool that shows it off: a few
 * pieces of work are dragged in, play as a GIF, and one click on Download
 * GIF makes and saves it. Plays only while on screen.
 */
export function CyclesDemo({ images }: { images: string[] }) {
  const fitRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [phase, setPhase] = useState<Phase>("empty");
  const [current, setCurrent] = useState(0);
  const frames = images.slice(0, 3);

  // Scale the fixed-size stage to the container's width.
  useEffect(() => {
    const fit = fitRef.current;
    if (!fit) return;
    const observer = new ResizeObserver(() => setScale(fit.clientWidth / W));
    observer.observe(fit);
    return () => observer.disconnect();
  }, []);

  // Run the timeline while it's on screen; with reduced motion, just show it playing.
  useEffect(() => {
    const fit = fitRef.current;
    if (!fit) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("play");
      return;
    }
    let timers: ReturnType<typeof setTimeout>[] = [];
    const stop = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };
    const run = () => {
      stop();
      TIMELINE.forEach(([next, at]) => timers.push(setTimeout(() => setPhase(next), at)));
      timers.push(setTimeout(run, LOOP_MS));
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) run();
      else stop();
    });
    observer.observe(fit);
    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  // The frames cycle from when they start playing until the loop resets.
  const playing = atLeast(phase, "play") && phase !== "out";
  useEffect(() => {
    setCurrent(0);
    if (!playing || frames.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setCurrent((i) => (i + 1) % frames.length), FRAME_MS);
    return () => clearInterval(timer);
  }, [playing, frames.length]);

  const loaded = atLeast(phase, "drop") && phase !== "out";
  const [x, y] = CURSOR[phase];
  const total = (frames.length * FRAME_MS) / 1000;

  return (
    <div ref={fitRef} className={styles.fit} style={{ height: H * scale || undefined }} aria-hidden="true">
      <div className={styles.stage} style={{ width: W, height: H, transform: `scale(${scale})` }} data-phase={phase}>
        {/* Top bar */}
        <div className={styles.top}>
          <span className={styles.crumbs}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/smile.svg" alt="" width={9} height={9} />
            <span>Labs</span>
            <i>/</i>
            <b>Cycles</b>
          </span>
          <span className={styles.file}>
            cycles<span>.gif</span>
          </span>
          <span className={styles.mono}>{loaded ? `${total.toFixed(1)}s` : "—"}</span>
        </div>

        {/* Canvas */}
        <div className={styles.canvas}>
          <div className={styles.bar}>
            <span>{loaded ? `Frame ${pad(current + 1)} / ${pad(frames.length)}` : "No frames"}</span>
          </div>
          <div className={styles.preview}>
            {loaded ? (
              frames.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" data-on={i === current || undefined} />
              ))
            ) : (
              <span className={styles.drop}>Drop images</span>
            )}
          </div>
          <div className={styles.tray}>
            <span className={styles.add}>+</span>
            {frames.map((src, i) => (
              <span
                key={src}
                className={styles.tile}
                data-in={loaded || undefined}
                data-current={(playing && i === current) || undefined}
                style={{ transitionDelay: loaded ? `${i * 90}ms` : "0ms" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" />
                <span
                  key={`${current}-${playing}`}
                  className={styles.progress}
                  data-state={!playing ? "empty" : i < current ? "full" : i === current ? "run" : "empty"}
                />
              </span>
            ))}
          </div>
          {/* The saved file, once it's downloaded. */}
          <div className={styles.toast} data-on={phase === "done" || undefined}>
            <span className={styles.check}>✓</span> cycles.gif <span>· saved</span>
          </div>
        </div>

        {/* Inspector */}
        <div className={styles.side}>
          <p className={styles.label}>Timing</p>
          <p className={styles.row}>
            <span>Frame</span>
            <b>{FRAME_MS} ms</b>
          </p>
          <p className={styles.row}>
            <span>Loop</span>
            <b>∞</b>
          </p>
          <p className={styles.label}>Output</p>
          <p className={styles.row}>
            <span>Width</span>
            <b>Original</b>
          </p>
          <p className={styles.row}>
            <span>Colors</span>
            <b>256</b>
          </p>
          <span
            className={styles.button}
            data-pressed={phase === "making" || undefined}
            data-state={phase === "making" ? "making" : phase === "done" ? "done" : undefined}
          >
            <span className={styles.fill} />
            <span className={styles.buttonText}>
              {phase === "making" ? "Making GIF…" : phase === "done" ? "Downloaded" : "Download GIF"}
            </span>
          </span>
        </div>

        {/* The pointer, carrying the images in. */}
        <div className={styles.cursor} style={{ transform: `translate(${x}px, ${y}px)` }}>
          <div className={styles.stack} data-on={phase === "drag" || undefined}>
            {frames.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" style={{ transform: `rotate(${(i - 1) * 7}deg)` }} />
            ))}
          </div>
          <svg width="12" height="16" viewBox="0 0 12 16">
            <path d="M1 1v12.5l3.2-3 2.3 5 2-.9-2.2-4.9H10.5z" fill="#fff" stroke="#000" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}
