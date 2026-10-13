"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { faqs } from "@/content/site";
import { askQuestion, openAskBox } from "@/lib/ask-box";
import { parseAnswer } from "@/lib/chat";
import { streamChat } from "@/lib/chat-client";
import { BotFace } from "./BotFace";
import styles from "./HeroAsk.module.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// The questions offered as chips under the box: the first few FAQs.
const CHIPS = faqs.slice(0, 4);

export type HeroArt = { src: string; width: number; height: number };

/*
 * Ways to give the hero more weight, previewed with ?top=1…8 and a small
 * switcher. Without ?top the hero is plain, as it is now.
 */
const VARIANTS = [
  "Work behind it",
  "Work strip",
  "Big headline",
  "Glow",
  "Orbiting work",
  "Answers here",
  "Live ticker",
  "In a card",
] as const;

// Placeholder activity for the ticker mockup; the real one would come from Trello.
const TICKER = [
  "A logo just landed for a fintech team",
  "Series A deck delivered · 31 hours",
  "New request: app onboarding screens",
  "Brand guide approved after 2 revisions",
  "Launch ads delivered · 26 hours",
];

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
export function HeroAsk({ art = [] }: { art?: HeroArt[] }) {
  const ref = useRef<HTMLElement>(null);
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [variant, go] = useVariant();
  // An answer shown right here, for the "Answers here" option.
  const [answer, setAnswer] = useState<{ q: string; text: string; done: boolean } | null>(null);
  const [tick, setTick] = useState(0);
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

  useEffect(() => {
    if (variant !== 7) return;
    const t = window.setInterval(() => setTick((n) => n + 1), 3200);
    return () => clearInterval(t);
  }, [variant]);

  async function answerHere(question: string) {
    const faq = faqs.find((f) => f.question === question);
    if (faq) {
      setAnswer({ q: question, text: parseAnswer(faq.answer).text, done: true });
      return;
    }
    setAnswer({ q: question, text: "", done: false });
    try {
      await streamChat([{ role: "user", content: question }], (text) =>
        setAnswer({ q: question, text: parseAnswer(text).text, done: false }),
      );
      setAnswer((a) => (a ? { ...a, done: true } : a));
    } catch {
      setAnswer({ q: question, text: "Something went wrong. Try asking in the chat.", done: true });
    }
  }

  const ask = (question: string) => (variant === 6 ? answerHere(question) : askQuestion(question));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setInput("");
    ask(question);
  }

  const pick = (from: number, count: number) =>
    Array.from({ length: count }, (_, i) => art[(from + i) % Math.max(art.length, 1)]).filter(Boolean);

  const content = (
    <>
      {variant === 2 && art.length > 0 && (
        <div className={styles.strip} aria-hidden="true">
          <div className={styles.stripRow}>
            {[...pick(0, 10), ...pick(0, 10)].map((a, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={a.src} alt="" style={{ aspectRatio: `${a.width} / ${a.height}` }} />
            ))}
          </div>
        </div>
      )}
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
      <div className={styles.boxWrap}>
        {variant === 4 && <span className={styles.glow} aria-hidden="true" />}
        {variant === 5 &&
          pick(2, 6).map((a, i) => (
            <span key={i} className={styles.orbit} data-i={i} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.src} alt="" />
            </span>
          ))}
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
      {variant === 6 && answer && (
        <div className={styles.inline} aria-live="polite">
          <p className={styles.inlineQ}>{answer.q}</p>
          <p className={styles.inlineA}>{answer.text || "…"}</p>
          {answer.done && (
            <div className={styles.inlineNext}>
              <button type="button" className={styles.solid} onClick={() => openAskBox("pricing")}>
                See plans
              </button>
              <button type="button" className={styles.outline} onClick={() => askQuestion(answer.q)}>
                Keep chatting
              </button>
            </div>
          )}
        </div>
      )}
      <div className={styles.chips}>
        {CHIPS.map((faq) => (
          <button key={faq.question} type="button" onClick={() => ask(faq.question)}>
            {faq.question}
          </button>
        ))}
      </div>
      {variant === 7 && (
        <p className={styles.ticker} aria-live="off">
          <span className={styles.liveDot} aria-hidden="true" />
          <span key={tick} className={styles.tickerText}>
            {TICKER[tick % TICKER.length]}
          </span>
        </p>
      )}
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
        {variant === 1 && art.length > 0 && (
          <div className={styles.wall} aria-hidden="true">
            <div className={styles.wallInner}>
              {pick(0, 18).map((a, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={a.src} alt="" style={{ "--i": i } as CSSProperties} />
              ))}
            </div>
          </div>
        )}
        {variant === 8 ? <div className={styles.card}>{content}</div> : content}
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
