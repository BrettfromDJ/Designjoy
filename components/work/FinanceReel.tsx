"use client";

import { useEffect, useRef, useState } from "react";
import { BudgetCard } from "./BudgetCard";
import { EarningsCard, RatingsCard, StatsCard } from "./FinanceCards";
import styles from "./FinanceReel.module.css";

const SLIDES = [BudgetCard, RatingsCard, EarningsCard, StatsCard];
const SLIDE_MS = 6500;

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
    <div ref={ref} className={styles.tile} aria-label="Finance app: budget, analyst ratings, earnings and fundamentals">
      {SLIDES.map((Slide, i) => (
        <div key={i} className={styles.slide} data-active={i === current || undefined} aria-hidden={i !== current}>
          {/* A new key each time it comes round restarts its animations. */}
          <Slide key={plays[i]} play={plays[i]} large={large} />
        </div>
      ))}
      <div className={styles.dots} aria-hidden="true">
        {SLIDES.map((_, i) => (
          <span key={i} data-on={i === current || undefined} />
        ))}
      </div>
    </div>
  );
}
