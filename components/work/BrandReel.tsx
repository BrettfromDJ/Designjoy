"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ComponentType, type CSSProperties } from "react";
import styles from "./BrandReel.module.css";

const SHOW_MS = 3800;
// The stripes take this long to sweep in (and again to sweep away).
const SWEEP_MS = 650;
// And the reveals (where the next slide comes in over the last) this long.
const ENTER_MS = 1250;

// The ways between slides (see BrandReel.module.css). Each reel takes its
// own set in turn, so no two changes look alike. Those that cover the slide
// with the bars (`bars`) and uncover the next:
//   rise, fall, zip, across: stripes up, down, from both ends, or across;
//   doors: two panels closing from the sides and opening again.
// And those that bring the next slide in over the last:
//   sunrise: opening as a circle from the bottom centre;
//   push: sliding in and pushing the last aside;
//   lift: rising from below and lifting the last away;
//   frame: opening out from a box in the middle (`frame`, in the slide's px);
//   mark: showing through the brand's mark as it grows (`mark`, an image).
export type Transition = "rise" | "fall" | "zip" | "across" | "doors" | "sunrise" | "push" | "lift" | "frame" | "mark";
const COVERS = new Set<Transition>(["rise", "zip", "across", "fall", "doors"]);

/**
 * A brand book from Figma as a reel: each slide (built in code, drawn at
 * 1440 × 1024 and scaled to the tile) comes in with its own motion, and a
 * different transition takes it to the next each time, from the brand's own
 * set (`transitions`, see Transition). The next slide
 * is drawn out of sight so its images are ready. It only runs while on
 * screen, and holds on the first slide with reduced motion.
 */
export function BrandReel({
  slides,
  transitions,
  bars = [],
  frame,
  mark,
  label,
  className = "",
}: {
  slides: ComponentType[];
  transitions: Transition[];
  /** The colours of the covering bars (for the covering transitions). */
  bars?: string[];
  /** The box `frame` opens out from: [top, right, bottom, left] insets. */
  frame?: [number, number, number, number];
  /** The image `mark` reveals through. */
  mark?: string;
  label: string;
  /** For the brand's fonts (next/font variables). */
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  // The slide on its way out, while the next comes in over it.
  const [leaving, setLeaving] = useState<number | null>(null);
  const [sweep, setSweep] = useState<"idle" | "cover" | "reveal" | "enter">("idle");
  // How many changes so far, which picks the next transition.
  const [turn, setTurn] = useState(0);
  const transition = transitions[turn % transitions.length];

  // The slides are drawn at 1440 wide and scaled to the tile's width, set
  // here (before it paints, and again whenever the tile resizes). The CSS
  // works it out too, but not in every browser.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => el.style.setProperty("--k", String(el.clientWidth / 1440));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Show a slide, then change: either sweep the stripes in, change slides
  // under them and sweep them out; or bring the next slide in over the last.
  useEffect(() => {
    if (!visible) return;
    const next = (i: number) => (i + 1) % slides.length;
    let t: ReturnType<typeof setTimeout>;
    if (sweep === "idle") {
      t = setTimeout(() => {
        if (COVERS.has(transition)) {
          setSweep("cover");
        } else {
          setLeaving(index);
          setIndex(next);
          setSweep("enter");
        }
      }, SHOW_MS);
    } else if (sweep === "cover") {
      t = setTimeout(() => {
        setIndex(next);
        setSweep("reveal");
      }, SWEEP_MS + 120);
    } else {
      t = setTimeout(
        () => {
          setLeaving(null);
          setSweep("idle");
          setTurn((n) => n + 1);
        },
        sweep === "enter" ? ENTER_MS : SWEEP_MS + 120,
      );
    }
    return () => clearTimeout(t);
  }, [visible, sweep, transition, index, slides.length]);

  const Next = slides[(index + 1) % slides.length];

  return (
    <div
      ref={ref}
      className={`${styles.tile} ${className}`}
      style={
        {
          ...(frame && { "--frame": frame.map((n) => `${n}px`).join(" ") }),
          ...(mark && { "--mark": `url(${mark})` }),
        } as CSSProperties
      }
      aria-label={label}
    >
      <div className={styles.stage} data-play={visible || undefined} data-transition={transition} data-sweep={sweep}>
        {/* Keyed by slide in one list: the slide going out stays as it was
            under the one coming in, which mounts fresh so its motion plays. */}
        {(leaving === null ? [index] : [leaving, index]).map((i) => {
          const Shown = slides[i];
          return (
            <div
              key={i}
              className={i === index ? styles.current : styles.leaving}
              data-slide={i === index ? i : undefined}
            >
              <Shown />
            </div>
          );
        })}
        {/* The next slide, out of sight, so its images are loaded in time. */}
        {visible && (
          <div className={styles.upcoming} aria-hidden="true">
            <Next />
          </div>
        )}
        <div className={styles.sweep} aria-hidden="true">
          {bars.map((color, i) => (
            <span key={i} style={{ background: color, "--i": i } as CSSProperties} />
          ))}
        </div>
      </div>
    </div>
  );
}
