"use client";

import { useEffect, useRef, useState } from "react";
import { scopeOfWork } from "@/content/site";
import styles from "./ScopeBoard.module.css";

const STEP_MS = 1700;
const MOVE_MS = 600;

/**
 * "Scope of work" card: services in large type stepping up one line at a
 * time like a departures board, with the middle line lit.
 */
export function ScopeBoard({ height }: { height: number }) {
  const count = scopeOfWork.length;
  // The list is doubled so it can step past the end and snap back unseen.
  const rows = [...scopeOfWork, ...scopeOfWork];
  const [index, setIndex] = useState(0);
  const [instant, setInstant] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    // Only run while the card is on screen.
    const observer = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) timer = setInterval(() => setIndex((i) => i + 1), STEP_MS);
    });
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, []);

  // After stepping onto the second copy of the first service, jump back to
  // the first copy without animating.
  useEffect(() => {
    if (index < count) return;
    const snap = setTimeout(() => {
      setInstant(true);
      setIndex(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setInstant(false)));
    }, MOVE_MS + 50);
    return () => clearTimeout(snap);
  }, [index, count]);

  return (
    <section ref={ref} className={styles.card} style={{ height }} aria-labelledby="scope-title">
      <div>
        <p className={styles.label}>Scope of work</p>
        <h2 id="scope-title" className={styles.title}>
          Everything you need, <span className={styles.muted}>one subscription.</span>
        </h2>
      </div>
      <ul className="visually-hidden">
        {scopeOfWork.map((service) => (
          <li key={service}>{service}</li>
        ))}
      </ul>
      <div className={styles.board} aria-hidden="true">
        <div
          className={styles.list}
          style={{
            transform: `translateY(${-index * 40}px)`,
            transition: instant ? "none" : undefined,
          }}
        >
          {rows.map((service, n) => (
            <div
              key={n}
              className={n === index ? `${styles.row} ${styles.on}` : styles.row}
              data-n={String((n % count) + 1).padStart(2, "0")}
              style={instant ? { transition: "none" } : undefined}
            >
              {service}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
