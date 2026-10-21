"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useCountUp } from "./useCountUp";
import styles from "./BudgetCard.module.css";

const DIR = "/work/budget";

// The design's six months, as placed in Figma (in its pixels: x, top, width,
// height of each bar; the month label sits under it at `label`).
const BARS = [
  { month: "JAN", x: 51.95, top: 185.2, w: 15.444, h: 256.935, label: 40.72, lw: 36.504 },
  { month: "FEB", x: 134.78, top: 224.51, w: 15.444, h: 217.622, label: 123.55, lw: 36.504 },
  { month: "MAR", x: 219.03, top: 204.85, w: 15.444, h: 237.279, label: 206.39, lw: 37.908 },
  { month: "APR", x: 303.27, top: 291.91, w: 14.04, h: 150.23, label: 290.63, lw: 36.504 },
  { month: "MAY", x: 386.1, top: 165.54, w: 14.04, h: 276.591, label: 373.47, lw: 37.908 },
  { month: "JUN", x: 468.94, top: 270.84, w: 15.444, h: 171.29, label: 457.71, lw: 36.504 },
];

const BUDGET = 9500;

/** Places an element at the design's coordinates, scaled to the card. */
const at = (x: number, y: number, w?: number, h?: number) =>
  ({
    "--x": x,
    "--y": y,
    ...(w !== undefined ? { "--w": w } : {}),
    ...(h !== undefined ? { "--h": h } : {}),
  }) as CSSProperties;

/**
 * The "Shared budget" card from the Figma design: its chart animates each
 * time `play` changes (the bars grow, the budget counts up, the budget line
 * draws across) while the meadow behind it slowly settles.
 * Shown in the finance reel (see FinanceReel).
 */
export function BudgetCard({ play, large = false }: { play: number; large?: boolean }) {
  const amount = Math.round(useCountUp(BUDGET, play) / 10) * 10;

  return (
    <div className={styles.card} data-play={play > 0 || undefined}>
        <div className={styles.photos} aria-hidden="true">
          <Image
            src={`${DIR}/meadow.jpg`}
            alt=""
            fill
            sizes={large ? "70vw" : "(min-width: 1600px) 30vw, 60vw"}
            className={styles.photo}
          />
          <span className={styles.fade} />
        </div>

        <div className={styles.panel}>
          <img src={`${DIR}/line-top.svg`} alt="" className={styles.line} style={at(0, 79.82 - 1.33, 532.122, 1.33)} />
          <p className={styles.label} style={at(26.61, 30.6)}>
            Monthly suggested budget
          </p>
          <p className={styles.amount} style={at(25.28, 101.1)}>
            ${amount.toLocaleString("en-US")}
          </p>
          {BARS.map((bar, i) => (
            <img
              key={bar.month}
              src={`${DIR}/bar-${i + 1}.svg`}
              alt=""
              className={styles.bar}
              style={{ ...at(bar.x, bar.top, bar.w, bar.h), "--i": i } as CSSProperties}
            />
          ))}
          <img src={`${DIR}/line-bottom.svg`} alt="" className={styles.line} style={at(0, 442.13 - 1.35, 532.122, 1.35)} />
          <img
            src={`${DIR}/line-budget.svg`}
            alt=""
            className={`${styles.line} ${styles.budget}`}
            style={at(0, 239.96 - 1.54, 494.214, 1.54)}
          />
          <img src={`${DIR}/dot.svg`} alt="" className={styles.dot} style={at(487.19, 233.07, 11.232, 11.232)} />
          {BARS.map((bar) => (
            <p key={bar.month} className={styles.month} style={at(bar.label, 471.75, bar.lw)}>
              {bar.month}
            </p>
          ))}
        </div>

        <div className={styles.copy}>
          <p className={styles.heading}>Build a shared budget with AI</p>
          <p className={styles.body}>
            Create a smart household budget based on both your spending habits that you can adjust together as
            life changes.
          </p>
        </div>
    </div>
  );
}
