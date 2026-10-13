"use client";

import { useEffect, useRef, useState } from "react";
import { faqs } from "@/content/site";
import { askQuestion } from "@/lib/ask-box";
import { BotFace } from "./BotFace";
import styles from "./HeroAsk.module.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// The questions offered as chips under the box: the first few FAQs.
const CHIPS = faqs.slice(0, 4);

/**
 * The homepage hero: the ask box, big and front and centre. Asking here opens
 * the real ask box with the answer. While this is on screen the small ask
 * pill at the top stays hidden; once it scrolls away, the pill takes over.
 */
export function HeroAsk() {
  const ref = useRef<HTMLElement>(null);
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
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
  }, []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setInput("");
    askQuestion(question);
  }

  return (
    <section ref={ref} data-hero className={styles.hero} aria-labelledby="hero-title">
      {/* The logo leads the page, now the nav sits at the bottom. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/smile.svg" alt="Designjoy" width={72} height={72} className={styles.logo} />
      <p className={styles.status}>
        <span className={styles.liveDot} aria-hidden="true" />
        Spots available · Start today
      </p>
      <h1 id="hero-title" className={styles.title}>
        Design, on subscription.
      </h1>
      <p className={styles.sub}>
        Subscribe today and most requests land {day ? `by ${day}` : "in about two days"}.{" "}
        <span className={styles.muted}>Unlimited requests, $4,995 a month, no contracts.</span>
      </p>
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
      <div className={styles.chips}>
        {CHIPS.map((faq) => (
          <button key={faq.question} type="button" onClick={() => askQuestion(faq.question)}>
            {faq.question}
          </button>
        ))}
      </div>
    </section>
  );
}
