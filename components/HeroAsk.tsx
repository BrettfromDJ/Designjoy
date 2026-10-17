"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Faq } from "@/content/site";
import { askQuestion } from "@/lib/ask-box";
import { BotFace } from "./BotFace";
import styles from "./HeroAsk.module.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// The questions offered as chips under the box: the first few FAQs.

export type HeroArt = { src: string; width: number; height: number };

/*
 * Big-headline treatments for the hero, previewed with ?top=1…9 and a small
 * switcher. Without ?top the hero is as it is now.
 */
const VARIANTS = [
  "Big",
  "Big, split",
  "Big, two tones",
  "Big, filled with work",
  "Big, box overlaps",
  "Edge to edge",
  "Big, words rise",
  "Big + glow",
  "Big, serif italic",
] as const;

function useVariant() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const v = Number(new URLSearchParams(window.location.search).get("top"));
    if (v >= 1 && v <= VARIANTS.length) setN(v);
  }, []);
  const go = (to: number) => {
    const next = ((to - 1 + VARIANTS.length) % VARIANTS.length) + 1;
    const url = new URL(window.location.href);
    url.searchParams.set("top", String(next));
    window.history.replaceState(null, "", url);
    setN(next);
  };
  return [n, go] as const;
}

/**
 * The homepage hero: the ask box, big and front and centre. Asking here opens
 * the real ask box with the answer. While this is on screen the small ask
 * pill at the top stays hidden; once it scrolls away, the pill takes over.
 */
export function HeroAsk({ art = [], faqs = [] }: { art?: HeroArt[]; faqs?: Faq[] }) {
  const chips = faqs.slice(0, 4);
  const ref = useRef<HTMLElement>(null);
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [variant, go] = useVariant();
  // The weekday 48 hours from now, set after mount so it's the visitor's own.
  const [day, setDay] = useState("");
  useEffect(() => setDay(DAYS[new Date(Date.now() + 48 * 3600 * 1000).getDay()]), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) document.body.dataset.heroAsk = "";
        else delete document.body.dataset.heroAsk;
      },
      // Counts as gone once the box itself has scrolled under the top edge.
      { rootMargin: "-40px 0px 0px 0px" },
    );
    observer.observe(el.querySelector("form") ?? el);
    return () => {
      observer.disconnect();
      delete document.body.dataset.heroAsk;
    };
    // The form is rebuilt when the preview option changes, so watch the new one.
  }, [variant]);

  const ask = (question: string) => askQuestion(question);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setInput("");
    ask(question);
  }

  // Work shown inside the letters, for "Big, filled with work".
  const fill = art[0]?.src;

  const content = (
    <>
      <p className={styles.status}>
        <span className={styles.liveDot} aria-hidden="true" />
        Spots available · Start today
      </p>
      <h1
        id="hero-title"
        className={styles.title}
        style={fill ? ({ "--fill": `url("${fill}")` } as CSSProperties) : undefined}
      >
        <span className={styles.w1}>Design,</span> <span className={styles.w2}>on subscription.</span>
      </h1>
      <p className={styles.sub}>
        Subscribe today and most requests land {day ? `by ${day}` : "in about two days"}.{" "}
        <span className={styles.muted}>Unlimited requests, $4,995 a month, no contracts.</span>
      </p>
      <div className={styles.boxWrap}>
        {variant === 8 && <span className={styles.glow} aria-hidden="true" />}
        <form className={styles.box} onSubmit={submit}>
          <BotFace size={30} typing={focused && input.length > 0} />
          <label htmlFor="hero-ask" className="visually-hidden">
            Ask anything about Designjoy
          </label>
          <input
            id="hero-ask"
            className={styles.input}
            placeholder="Ask anything about Designjoy"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <button type="submit" className={styles.submit} disabled={!input.trim()}>
            Ask
          </button>
        </form>
      </div>
      <div className={styles.chips}>
        {chips.map((faq) => (
          <button key={faq.question} type="button" onClick={() => ask(faq.question)}>
            {faq.question}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <>
      <section
        ref={ref}
        data-hero
        data-variant={variant || undefined}
        className={styles.hero}
        aria-labelledby="hero-title"
      >
        {content}
      </section>
      {/* Outside the section, whose own stacking would put it under the grid. */}
      {variant > 0 && (
        <div className={styles.switcher} role="group" aria-label="Hero preview">
          <button type="button" onClick={() => go(variant - 1)} aria-label="Previous">
            ‹
          </button>
          <span>
            <b>{variant}</b>/{VARIANTS.length} · {VARIANTS[variant - 1]}
          </span>
          <button type="button" onClick={() => go(variant + 1)} aria-label="Next">
            ›
          </button>
        </div>
      )}
    </>
  );
}
