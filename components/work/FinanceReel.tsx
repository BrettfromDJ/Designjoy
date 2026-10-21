"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BudgetCard } from "./BudgetCard";
import { EarningsCard, RatingsCard, StatsCard } from "./FinanceCards";
import styles from "./FinanceReel.module.css";

const SLIDES = [BudgetCard, RatingsCard, EarningsCard, StatsCard];
const SLIDE_MS = 6500;

/*
 * Ways to move between the cards, previewed with ?reel=1…6 and a small
 * switcher. Without ?reel it cross-fades (1).
 */
const TRANSITIONS = ["Cross-fade", "Carousel", "Deck", "Flip", "Blur", "Wipe"] as const;

function useTransition() {
  const [n, setN] = useState(1);
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    const v = Number(new URLSearchParams(window.location.search).get("reel"));
    if (v >= 1 && v <= TRANSITIONS.length) {
      setN(v);
      setPreview(true);
    }
  }, []);
  const go = (to: number) => {
    const next = ((to - 1 + TRANSITIONS.length) % TRANSITIONS.length) + 1;
    const url = new URL(window.location.href);
    url.searchParams.set("reel", String(next));
    window.history.replaceState(null, "", url);
    setN(next);
  };
  return [n, preview, go] as const;
}

/** Where a card is relative to the one showing: next up, just gone, or out of the way. */
function position(i: number, current: number) {
  const offset = (i - current + SLIDES.length) % SLIDES.length;
  return offset === 0 ? "current" : offset === 1 ? "next" : offset === SLIDES.length - 1 ? "prev" : "away";
}

/**
 * The finance app work sample: the cards from the Figma designs on a black
 * tile, taking turns. Each animates in as it comes round; it only moves
 * while on screen, and stays on the first card with reduced motion.
 */
export function FinanceReel({ large = false }: { large?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  // How many times each card has come round, to replay its animation.
  const [plays, setPlays] = useState<number[]>(() => SLIDES.map(() => 0));
  const [transition, preview, goTransition] = useTransition();

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Coming into view replays the current card; then the cards take turns.
  useEffect(() => {
    if (!visible) return;
    setPlays((p) => p.map((n, i) => (i === current ? n + 1 : n)));
    const timer = setTimeout(() => setCurrent((c) => (c + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(timer);
    // Only when the card changes or it comes into view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, current]);

  return (
    <div ref={ref} className={styles.tile} data-transition={transition} aria-label="Finance app: budget, analyst ratings, earnings and fundamentals">
      {SLIDES.map((Slide, i) => (
        <div
          key={i}
          className={styles.slide}
          data-active={i === current || undefined}
          data-pos={position(i, current)}
          aria-hidden={i !== current}
        >
          {/* A new key each time it comes round restarts its animations. */}
          <Slide key={plays[i]} play={plays[i]} large={large} />
        </div>
      ))}
      <div className={styles.dots} aria-hidden="true">
        {SLIDES.map((_, i) => (
          <span key={i} data-on={i === current || undefined} />
        ))}
      </div>
      {preview &&
        !large &&
        createPortal(
          <div className={styles.switcher} role="group" aria-label="Card transition preview">
            <button type="button" onClick={() => goTransition(transition - 1)} aria-label="Previous">
              ‹
            </button>
            <span>
              <b>{transition}</b>/{TRANSITIONS.length} · {TRANSITIONS[transition - 1]}
            </span>
            <button type="button" onClick={() => goTransition(transition + 1)} aria-label="Next">
              ›
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
