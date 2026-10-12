"use client";

import { useEffect, useState } from "react";
import { openAskBox } from "@/lib/ask-box";
import styles from "./Hero.module.css";

const TOTAL = 48 * 3600;
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const pad = (n: number) => String(n).padStart(2, "0");

/** Counts down 48 hours from when the page opened, as hours, minutes, seconds. */
function useCountdown() {
  const [left, setLeft] = useState(TOTAL);
  useEffect(() => {
    const due = Date.now() + TOTAL * 1000;
    const t = window.setInterval(() => setLeft(Math.max(0, Math.round((due - Date.now()) / 1000))), 1000);
    return () => clearInterval(t);
  }, []);
  return [
    [pad(Math.floor(left / 3600)), "Hours"],
    [pad(Math.floor(left / 60) % 60), "Minutes"],
    [pad(left % 60), "Seconds"],
  ] as const;
}

/**
 * The homepage hero: a 48-hour countdown to "your first design", in three big
 * labelled columns, above the grid.
 */
export function Hero() {
  const columns = useCountdown();
  // The weekday 48 hours from now, set after mount so it's the visitor's own.
  const [day, setDay] = useState("");
  useEffect(() => setDay(DAYS[new Date(Date.now() + TOTAL * 1000).getDay()]), []);

  return (
    <section data-hero className={styles.hero} aria-labelledby="hero-label">
      <p id="hero-label" className={`${styles.label} ${styles.rise}`}>
        Your first design, in about
      </p>
      <div className={`${styles.columns} ${styles.rise}`} data-delay="1" role="timer" aria-label="48 hours">
        {columns.map(([value, label]) => (
          <div key={label}>
            <span className={styles.value} aria-hidden="true">
              {value}
            </span>
            <span className={styles.label}>{label}</span>
          </div>
        ))}
      </div>
      <div className={styles.foot}>
        <p className={`${styles.lede} ${styles.rise}`} data-delay="2">
          Subscribe today and most requests land {day ? `by ${day}` : "in about two days"}. Unlimited requests,
          $4,995 a month, no contracts.
        </p>
        <div className={`${styles.buttons} ${styles.rise}`} data-delay="3">
          <button type="button" className={styles.primary} onClick={() => openAskBox("pricing")}>
            See plans
          </button>
          <button type="button" className={styles.secondary} onClick={() => openAskBox("booking")}>
            Book a call
          </button>
        </div>
      </div>
    </section>
  );
}
