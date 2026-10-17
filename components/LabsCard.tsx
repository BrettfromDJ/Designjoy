"use client";

import Link from "next/link";
import type { WorkItem } from "@/content/site";
import { CyclesDemo } from "./CyclesDemo";
import styles from "./LabsCard.module.css";

const FRAMES = 3;

/**
 * The Designjoy Labs tile. Its preview is a small animated replica of the
 * Cycles tool turning a few pieces of work into a GIF.
 */
export function LabsCard({ work }: { work: WorkItem[] }) {
  const frames = work.filter((w) => w.kind === "image").slice(0, FRAMES);

  return (
    <Link href="/labs/cycles" className={styles.card}>
      <div>
        <p className={styles.label}>Designjoy Labs</p>
        <h2 className={styles.title}>
          Free tools. <span className={styles.muted}>Made in-house.</span>
        </h2>
      </div>

      <CyclesDemo images={frames.map((f) => f.src)} />

      <div className={styles.tool}>
        <span>
          <span className={styles.toolName}>Cycles</span>
          <span className={styles.toolDescription}>Turn images into a GIF</span>
        </span>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </div>
    </Link>
  );
}
