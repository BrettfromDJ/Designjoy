"use client";

import { useState } from "react";
import { openHowItWorks } from "@/lib/how-it-works";
import { BOARD_STEPS, BoardDemo } from "./BoardDemo";
import styles from "./HowItWorksCard.module.css";

/**
 * "How it works": a homepage tile with a small looping preview of a client's
 * Trello board. Clicking it opens the tour in the ask box.
 */
export function HowItWorksCard() {
  return (
    <button type="button" className={styles.card} onClick={openHowItWorks}>
      <span className={styles.label}>How it works</span>
      <span className={styles.title}>
        See a request <span className={styles.muted}>go from idea to approved.</span>
      </span>
      <span className={styles.preview}>
        <BoardDemo />
      </span>
      <span className={styles.foot}>
        <span>Watch the 20-second tour</span>
        <span className={styles.play} aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M2.5 1.5v7l6-3.5z" fill="currentColor" />
          </svg>
        </span>
      </span>
    </button>
  );
}

/**
 * The tour, shown inside the ask box: the board, with one line underneath
 * that swaps for each step, and small progress dashes.
 */
export function Tour() {
  const [step, setStep] = useState(0);
  return (
    <div className={styles.tour}>
      <BoardDemo onStep={setStep} />
      <p className={styles.line} aria-live="polite">
        <span className={styles.stepNumber}>{String(step + 1).padStart(2, "0")}</span>
        <span key={step} className={styles.lineText}>
          {BOARD_STEPS[step]}
        </span>
        <span className={styles.dashes} aria-hidden="true">
          {BOARD_STEPS.map((_, i) => (
            <i key={i} data-on={i <= step || undefined} />
          ))}
        </span>
      </p>
    </div>
  );
}
