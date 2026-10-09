"use client";

import { useEffect, useState } from "react";
import { highlights, type HighlightIcon } from "@/content/site";
import styles from "./HighlightsCard.module.css";

const SHOW_MS = 3600;

// Simple monochrome line icons, drawn on a 32px grid.
const ICONS: Record<HighlightIcon, React.ReactNode> = {
  trophy: (
    <path d="M10 5h12v6a6 6 0 0 1-12 0V5Zm0 2H6v2a4 4 0 0 0 4 4m12-6h4v2a4 4 0 0 1-4 4m-6 4v5m-5 4h10m-8-4h6" />
  ),
  ribbon: (
    <path d="M16 4a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Zm-4.6 13.4L9 28l7-3.6 7 3.6-2.4-10.6M16 8.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
  ),
  star: (
    <path d="m16 4 3.6 7.6 8.4 1-6.2 5.8 1.6 8.3L16 22.6l-7.4 4.1 1.6-8.3L4 12.6l8.4-1L16 4Z" />
  ),
  medal: (
    <path d="M11 4h10l-3 8h-4l-3-8Zm5 8a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 3.5 1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4 1.2-2.4Z" />
  ),
};

/** Shuffles through project highlights: awards, features and mentions. */
export function HighlightsCard() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || highlights.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % highlights.length), SHOW_MS);
    return () => clearTimeout(timer);
  }, [index, paused]);

  const item = highlights[index];
  if (!item) return null;

  return (
    <section
      className={styles.card}
      aria-labelledby="highlights-title"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className={styles.head}>
        <p id="highlights-title" className={styles.label}>
          Highlights
        </p>
        <p className={styles.counter}>
          {String(index + 1).padStart(2, "0")} / {String(highlights.length).padStart(2, "0")}
        </p>
      </div>

      {/* Keyed, so each highlight animates in fresh. */}
      <div key={index} className={styles.item} aria-live="polite">
        <svg
          className={styles.icon}
          width="40"
          height="40"
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {ICONS[item.icon]}
        </svg>
        <p className={styles.title}>{item.title}</p>
        <p className={styles.detail}>{item.detail}</p>
      </div>

      <div className={styles.dots}>
        {highlights.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show highlight ${i + 1}`}
            aria-current={i === index || undefined}
            onClick={() => setIndex(i)}
          >
            {i === index && !paused && (
              <span className={styles.fill} style={{ animationDuration: `${SHOW_MS}ms` }} />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
