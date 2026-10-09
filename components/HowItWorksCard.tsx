"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { OPEN_HOW_IT_WORKS_EVENT, openHowItWorks } from "@/lib/how-it-works";
import { BOARD_STEPS, BoardDemo } from "./BoardDemo";
import styles from "./HowItWorksCard.module.css";

/**
 * "How it works": a homepage tile with a small looping preview of a client's
 * Trello board. Clicking it opens the tour.
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
 * The tour: the board large in a lightbox, with each step explained
 * underneath. Mounted once for the whole site, so the tile and the ask box
 * can both open it (with `openHowItWorks`).
 */
export function HowItWorksLightbox() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const show = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(OPEN_HOW_IT_WORKS_EVENT, show);
    return () => window.removeEventListener(OPEN_HOW_IT_WORKS_EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
      <div
        className={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-label="How it works"
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        <div className={styles.panel}>
          <button
            type="button"
            className={styles.close}
            aria-label="Close"
            onClick={() => setOpen(false)}
            autoFocus
          >
            ×
          </button>
          <p className={styles.label}>How it works</p>
          <h2 className={styles.panelTitle}>
            Your Trello board, <span className={styles.muted}>start to finish.</span>
          </h2>
          <BoardDemo onStep={setStep} />
          <p className={styles.caption} aria-live="polite">
            <span className={styles.stepNumber}>{String(step + 1).padStart(2, "0")}</span>
            {BOARD_STEPS[step]}
          </p>
          <ol className={styles.dots} aria-hidden="true">
            {BOARD_STEPS.map((_, i) => (
              <li key={i} data-state={i < step ? "past" : i === step ? "now" : undefined} />
            ))}
          </ol>
        </div>
      </div>,
      document.body,
  );
}
