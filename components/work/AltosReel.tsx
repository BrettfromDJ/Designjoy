"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Anta } from "next/font/google";
import { ALTOS_SLIDES } from "./AltosSlides";
import styles from "./AltosReel.module.css";

// The brand's display face, for its labels and logotype.
const anta = Anta({ subsets: ["latin"], weight: "400", variable: "--font-anta", preload: false });

const SHOW_MS = 3800;
// The stripes take this long to sweep in (and again to sweep away).
const SWEEP_MS = 650;
// And the reveals (where the next slide comes in over the last) this long.
const ENTER_MS = 1100;

// The ways between slides, taken in turn so no two changes look alike: the
// stripes rising, falling, zipping shut from both ends, or sweeping across
// as bands; the next slide opening as a sunrise; or pushing the last aside.
const TRANSITIONS = ["rise", "sunrise", "zip", "push", "across", "fall"] as const;
const COVERS = new Set<string>(["rise", "zip", "across", "fall"]);
// The Horizon Pattern's colours, for the bars of the sweep.
const BARS = ["#ff4000", "#000", "#828600", "#afb9ea", "#ff4000", "#000", "#828600", "#afb9ea", "#ff4000", "#000"];

/**
 * The Altos brand book from Figma, as a reel: each of its ten slides is
 * built in code and comes in with its own motion (guides drawing, stripes
 * rising, swatches filling), and a different transition takes it to the next
 * each time (see TRANSITIONS). The next slide is drawn out of sight so its
 * images are ready.
 * It only runs while on screen, and holds on the first slide with reduced
 * motion.
 */
export function AltosReel() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  // The slide on its way out, while the next comes in over it.
  const [leaving, setLeaving] = useState<number | null>(null);
  const [sweep, setSweep] = useState<"idle" | "cover" | "reveal" | "enter">("idle");
  // How many changes so far, which picks the next transition.
  const [turn, setTurn] = useState(0);
  const transition = TRANSITIONS[turn % TRANSITIONS.length];

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
    const next = (i: number) => (i + 1) % ALTOS_SLIDES.length;
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
  }, [visible, sweep, transition, index]);

  const Next = ALTOS_SLIDES[(index + 1) % ALTOS_SLIDES.length];

  return (
    <div
      ref={ref}
      className={`${styles.tile} ${anta.variable}`}
      aria-label="Altos brand book: wordmark, Horizon Pattern, posters, logo mark, applications, colours and type"
    >
      <div className={styles.stage} data-play={visible || undefined} data-transition={transition} data-sweep={sweep}>
        {/* Keyed by slide in one list: the slide going out stays as it was
            under the one coming in, which mounts fresh so its motion plays. */}
        {(leaving === null ? [index] : [leaving, index]).map((i) => {
          const Shown = ALTOS_SLIDES[i];
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
          {BARS.map((color, i) => (
            <span key={i} style={{ background: color, "--i": i } as CSSProperties} />
          ))}
        </div>
      </div>
    </div>
  );
}
