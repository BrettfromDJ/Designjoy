"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WorkItem } from "@/content/site";
import styles from "./LabsCard.module.css";

const FRAMES = 4;
const FRAME_MS = 900;

/**
 * The Designjoy Labs tile. Its preview plays a few pieces of work as a
 * sequence, the way the Sequence tool turns images into a GIF.
 */
export function LabsCard({ work }: { work: WorkItem[] }) {
  const frames = work.filter((w) => w.kind === "image").slice(0, FRAMES);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (frames.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setCurrent((i) => (i + 1) % frames.length), FRAME_MS);
    return () => clearInterval(timer);
  }, [frames.length]);

  return (
    <Link href="/labs/sequence" className={styles.card}>
      <div>
        <p className={styles.label}>Designjoy Labs</p>
        <h2 className={styles.title}>
          Free tools. <span className={styles.muted}>Made in-house.</span>
        </h2>
      </div>

      <div className={styles.preview} aria-hidden="true">
        {frames.map((frame, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={frame.id}
            src={frame.src}
            alt=""
            loading="lazy"
            className={styles.frame}
            data-on={i === current || undefined}
          />
        ))}
        <span className={styles.counter}>
          GIF · {current + 1}/{frames.length || 1}
        </span>
      </div>

      <div className={styles.tool}>
        <span>
          <span className={styles.toolName}>Sequence</span>
          <span className={styles.toolDescription}>Turn images into a GIF</span>
        </span>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </div>
    </Link>
  );
}
