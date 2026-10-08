"use client";

import { useEffect, useRef, useState } from "react";
import { testimonials, type Testimonial } from "@/content/site";
import styles from "./TestimonialCard.module.css";

const SHOW_MS = 4200;
const TYPING_MS = 800;

const quoted = (text: string) => `\u201c${text}\u201d`;

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Sender({ t }: { t: Testimonial }) {
  if (!t.name) {
    return t.logo ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={t.logo} alt={t.company ?? ""} className={styles.logo} />
    ) : (
      <span className={styles.company}>{t.company}</span>
    );
  }
  return (
    <>
      {t.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={t.photo} alt="" className={styles.avatar} />
      ) : (
        <span className={styles.avatar} aria-hidden="true">
          {initials(t.name)}
        </span>
      )}
      <span>
        <span className={styles.name}>{t.name}</span>
        {t.role && <span className={styles.role}>{t.role}</span>}
      </span>
    </>
  );
}

/**
 * "Kind words" card: each testimonial arrives like a chat message, with
 * typing dots before the quote appears.
 */
export function TestimonialCard({ height }: { height: number }) {
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const t = testimonials[index];

  // Move to the next quote on a timer, only while the card is on screen.
  useEffect(() => {
    if (testimonials.length < 2) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) {
        timer = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), SHOW_MS);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, []);

  // Show typing dots briefly before each quote (skipped for reduced motion).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setTyping(true);
    const done = setTimeout(() => setTyping(false), TYPING_MS);
    return () => clearTimeout(done);
  }, [index]);

  if (!t) return null;

  return (
    <section
      ref={ref}
      className={styles.card}
      style={{ height }}
      aria-labelledby="testimonials-title"
    >
      <p id="testimonials-title" className={styles.label}>
        Kind words
      </p>
      <ul className="visually-hidden">
        {testimonials.map((item) => (
          <li key={item.quote}>
            {quoted(item.quote)} — {item.name ?? item.company}
            {item.role ? `, ${item.role}` : ""}
          </li>
        ))}
      </ul>
      <div className={styles.chat} aria-hidden="true">
        <div key={`who-${index}`} className={`${styles.sender} ${styles.in}`}>
          <Sender t={t} />
        </div>
        {typing ? (
          <span className={styles.typing}>
            <i />
            <i />
            <i />
          </span>
        ) : (
          <p key={`quote-${index}`} className={`${styles.bubble} ${styles.in}`}>
            {quoted(t.quote)}
          </p>
        )}
      </div>
    </section>
  );
}
