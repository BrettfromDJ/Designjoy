"use client";

import { useEffect, useRef, useState } from "react";
import { faqs, type Faq } from "@/content/site";
import { calTrigger } from "@/lib/cal";
import { parseAnswer } from "@/lib/chat";
import { ChatError, streamChat, type ChatMessage } from "@/lib/chat-client";
import styles from "./FaqChat.module.css";

type Bubble = ChatMessage & { typing?: boolean; bookCall?: boolean };

const GREETING = "Hi! Tap a question below, or type your own.";
const TYPING_MS = 900;
const MAX_HISTORY = 12;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The FAQ as a conversation: tap a question, or ask anything else. */
export function FaqChat() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [asked, setAsked] = useState<Faq[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (bubbles.length) endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [bubbles]);

  // Answer a FAQ from the list, after a short "typing" pause.
  function askFaq(faq: Faq) {
    if (pending) return;
    setAsked((list) => [...list, faq]);
    setBubbles((list) => [
      ...list,
      { role: "user", content: faq.question },
      { role: "assistant", content: "", typing: true },
    ]);
    setPending(true);
    setTimeout(
      () => {
        setBubbles((list) => [...list.slice(0, -1), { role: "assistant", content: faq.answer }]);
        setPending(false);
      },
      prefersReducedMotion() ? 0 : TYPING_MS,
    );
  }

  // Open with the most common question.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const first = setTimeout(() => askFaq(faqs[0]), prefersReducedMotion() ? 0 : 700);
    return () => clearTimeout(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Anything else goes to the chatbot, with the conversation so far.
  async function askOwn(event: React.FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || pending) return;
    setInput("");
    setPending(true);
    const history: ChatMessage[] = [
      ...bubbles.map(
        ({ role, content }): ChatMessage => ({
          role,
          content: role === "assistant" ? parseAnswer(content).text : content,
        }),
      ),
      { role: "user" as const, content: question },
    ].slice(-MAX_HISTORY);
    // The history must start with a question.
    while (history[0]?.role === "assistant") history.shift();
    setBubbles((list) => [
      ...list,
      { role: "user", content: question },
      { role: "assistant", content: "", typing: true },
    ]);
    const setAnswer = (content: string, bookCall?: boolean) =>
      setBubbles((list) => [...list.slice(0, -1), { role: "assistant", content, bookCall }]);
    try {
      await streamChat(history, (text) => setAnswer(text));
    } catch (error) {
      setAnswer(
        error instanceof ChatError ? error.message : "Something went wrong. Please try again.",
        error instanceof ChatError && error.bookCall,
      );
    } finally {
      setPending(false);
    }
  }

  const remaining = faqs.filter((faq) => !asked.includes(faq));

  return (
    <section className={styles.panel} aria-label="Frequently asked questions">
      <div className={styles.thread} aria-live="polite">
        <p className={`${styles.bubble} ${styles.dj}`}>{GREETING}</p>
        {bubbles.map((b, i) => {
          if (b.role === "user") {
            return (
              <p key={i} className={`${styles.bubble} ${styles.me}`}>
                {b.content}
              </p>
            );
          }
          if (b.typing || !b.content) {
            return (
              <span
                key={i}
                className={`${styles.bubble} ${styles.dj} ${styles.typing}`}
                aria-label="Typing"
              >
                <i />
                <i />
                <i />
              </span>
            );
          }
          const { text, bookCall, billing } = parseAnswer(b.content);
          const done = !(pending && i === bubbles.length - 1);
          return (
            <div key={i} className={styles.answer}>
              <p className={`${styles.bubble} ${styles.dj}`}>{text}</p>
              {done && (bookCall || b.bookCall) && (
                <button type="button" className={styles.bookCall} {...calTrigger}>
                  Book a 15 min intro call
                </button>
              )}
              {done && billing && (
                <a href="/billing" target="_blank" rel="noopener" className={styles.bookCall}>
                  Manage billing →
                </a>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {remaining.length > 0 && (
        <div className={styles.chips} aria-label="Suggested questions">
          {remaining.map((faq) => (
            <button key={faq.question} type="button" onClick={() => askFaq(faq)} disabled={pending}>
              {faq.question}
            </button>
          ))}
        </div>
      )}

      <form className={styles.form} onSubmit={askOwn}>
        <label htmlFor="faq-input" className="visually-hidden">
          Ask your own question
        </label>
        <input
          id="faq-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Can't find it? Ask anything"
          autoComplete="off"
        />
        <button type="submit" disabled={pending || !input.trim()}>
          Ask
        </button>
      </form>
    </section>
  );
}
