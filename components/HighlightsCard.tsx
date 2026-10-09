"use client";

import { useEffect, useState } from "react";
import { HighlightIconSvg, type Highlight } from "@/lib/highlight-icons";
import styles from "./HighlightsCard.module.css";

const SHOW_MS = 3600;
const SEAL_TEXT = "AWARD-WINNING DESIGN · DESIGNJOY · AWARD-WINNING DESIGN · DESIGNJOY · ";

/**
 * Highlights: a slowly turning seal with the award's icon in the middle,
 * and the award underneath, changing every few seconds. Edited in
 * /admin/highlights.
 */
export function HighlightsCard({ highlights }: { highlights: Highlight[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || highlights.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % highlights.length), SHOW_MS);
    return () => clearTimeout(timer);
  }, [index, paused, highlights.length]);

  const item = highlights[index % highlights.length];
  if (!item) return null;

  return (
    <section
      className={styles.card}
      aria-label="Highlights"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className={styles.seal}>
        <svg className={styles.ring} viewBox="0 0 112 112" aria-hidden="true">
          <defs>
            <path id="highlights-seal-path" d="M56 56m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" />
          </defs>
          <circle cx="56" cy="56" r="54" fill="none" stroke="rgba(255,255,255,0.14)" />
          <text className={styles.ringText}>
            <textPath href="#highlights-seal-path">{SEAL_TEXT}</textPath>
          </text>
        </svg>
        {/* Keyed, so each icon animates in fresh. */}
        <span key={`icon-${index}`} className={styles.icon}>
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt="" width={36} height={36} />
          ) : (
            <HighlightIconSvg icon={item.icon} size={34} />
          )}
        </span>
      </div>

      <div key={`text-${index}`} className={styles.text} aria-live="polite">
        <p className={styles.title}>{item.title}</p>
        {item.detail && <p className={styles.detail}>{item.detail}</p>}
      </div>

      {highlights.length > 1 && (
        <div className={styles.dots}>
          {highlights.map((h, i) => (
            <button
              key={h.id}
              type="button"
              aria-label={`Show ${h.title}`}
              aria-current={i === index || undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
