"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Anta } from "next/font/google";
import { ALTOS_SLIDES } from "./AltosSlides";
import styles from "./AltosReel.module.css";

// The brand's display face, for its labels and logotype.
const anta = Anta({ subsets: ["latin"], weight: "400", variable: "--font-anta", preload: false });

const SHOW_MS = 3800;
// The stripes take this long to sweep in (and again to sweep away).
const SWEEP_MS = 650;
// The Horizon Pattern's colours, for the bars of the sweep.
const BARS = ["#ff4000", "#000", "#828600", "#afb9ea", "#ff4000", "#000", "#828600", "#afb9ea", "#ff4000", "#000"];

/**
 * The Altos brand book from Figma, as a reel: each of its ten slides is
 * built in code and comes in with its own motion (guides drawing, stripes
 * rising, swatches filling), and the Horizon Pattern's stripes sweep across
 * between them. The next slide is drawn out of sight so its images are ready.
 * It only runs while on screen, and holds on the first slide with reduced
 * motion.
 */
export function AltosReel() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [sweep, setSweep] = useState<"idle" | "cover" | "reveal">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Show a slide, sweep the stripes in, change slides under them, sweep out.
  useEffect(() => {
    if (!visible) return;
    if (sweep === "idle") {
      const t = setTimeout(() => setSweep("cover"), SHOW_MS);
      return () => clearTimeout(t);
    }
    if (sweep === "cover") {
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % ALTOS_SLIDES.length);
        setSweep("reveal");
      }, SWEEP_MS + 120);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSweep("idle"), SWEEP_MS + 120);
    return () => clearTimeout(t);
  }, [visible, sweep]);

  const Slide = ALTOS_SLIDES[index];
  const Next = ALTOS_SLIDES[(index + 1) % ALTOS_SLIDES.length];

  return (
    <div
      ref={ref}
      className={`${styles.tile} ${anta.variable}`}
      aria-label="Altos brand book: wordmark, Horizon Pattern, posters, logo mark, applications, colours and type"
    >
      <div className={styles.stage} data-play={visible || undefined}>
        {/* A new key each time, so each slide's motion plays as it shows. */}
        <div key={index} className={styles.current} data-slide={index}>
          <Slide />
        </div>
        {/* The next slide, out of sight, so its images are loaded in time. */}
        {visible && (
          <div className={styles.upcoming} aria-hidden="true">
            <Next />
          </div>
        )}
        <div className={styles.sweep} data-sweep={sweep} aria-hidden="true">
          {BARS.map((color, i) => (
            <span key={i} style={{ background: color, "--i": i } as CSSProperties} />
          ))}
        </div>
      </div>
    </div>
  );
}
