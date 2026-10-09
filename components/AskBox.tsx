"use client";

import { useEffect, useRef, useState } from "react";
import { faqs, plans, type Faq, type Plan } from "@/content/site";
import {
  OPEN_ASK_BOX_EVENT,
  type AskBoxView,
  type OpenAskBoxDetail,
} from "@/lib/ask-box";
import { parseAnswer } from "@/lib/chat";
import { ChatError, streamChat } from "@/lib/chat-client";
import { BotFace } from "./BotFace";
import { BookCall, BookCallMeta } from "./BookCall";
import { CheckoutPanel } from "./CheckoutPanel";
import { PlanPicker } from "./PlanPicker";
import styles from "./AskBox.module.css";

// `content` keeps the raw answer; `bookCall` forces the booking button (used for errors);
// `typing` shows dots while a FAQ answer is "being typed".
type Message = {
  role: "user" | "assistant";
  content: string;
  bookCall?: boolean;
  typing?: boolean;
};

const FAQ_TYPING_MS = 900;

const PLACEHOLDER = "Ask anything about Designjoy";
const SHORT_PLACEHOLDER = "Ask about Designjoy";
// Shown while pricing or booking is open (the short one on narrow phones).
const VIEW_HINTS: Partial<Record<AskBoxView, string>> = {
  pricing: "Not sure which plan? Just ask",
};
const SHORT_VIEW_HINT = "Questions? Just ask";
const VIEW_LABELS: Record<AskBoxView, string> = {
  chat: "FAQ",
  pricing: "Pricing",
  booking: "Book a call",
  checkout: "Checkout",
};
// Views shown without a label or the ask row: just the content and the close button.
const BARE_VIEWS: AskBoxView[] = ["booking", "checkout"];
const CYCLE_MS = 3200;
const FADE_MS = 300;

/**
 * Sample questions from the knowledge base, plus the placeholder, keeping
 * only text that fits the input without cutting off.
 */
function useSampleQuestions(
  inputRef: React.RefObject<HTMLInputElement | null>,
) {
  const [all, setAll] = useState<string[]>([]);
  const [fitting, setFitting] = useState<string[]>([]);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDER);

  useEffect(() => {
    fetch("/api/chat/questions")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => Array.isArray(data?.questions) && setAll(data.questions))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const ctx = document.createElement("canvas").getContext("2d");
    const measure = () => {
      if (!ctx) return setFitting(all);
      const style = getComputedStyle(input);
      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const room = input.clientWidth - 2;
      // measureText ignores letter-spacing, so add it per character.
      const spacing = parseFloat(style.letterSpacing) || 0;
      const fits = (text: string) =>
        ctx.measureText(text).width + spacing * text.length <= room;
      setPlaceholder(fits(PLACEHOLDER) ? PLACEHOLDER : SHORT_PLACEHOLDER);
      setFitting(all.filter(fits));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(input);
    return () => observer.disconnect();
  }, [all, inputRef]);

  return { samples: fitting, placeholder };
}

export function AskBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  // What the open panel shows: the conversation (with the FAQ), or the plans.
  const [mode, setMode] = useState<AskBoxView>("chat");
  const [checkoutPlan, setCheckoutPlan] = useState<Plan["id"]>(plans[0].id);
  const [pending, setPending] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle the placeholder through sample questions while the box is idle.
  const { samples, placeholder } = useSampleQuestions(inputRef);
  const [sampleIndex, setSampleIndex] = useState(-1); // -1 shows the default placeholder
  const [fading, setFading] = useState(false);
  const idle = !focused && !input && !pending;
  // With pricing or booking open, invite questions about it instead of cycling samples.
  const viewHint = open ? VIEW_HINTS[mode] : undefined;
  const pricingHint = Boolean(viewHint);
  const hint = viewHint
    ? placeholder === SHORT_PLACEHOLDER
      ? SHORT_VIEW_HINT
      : viewHint
    : placeholder;
  const sample =
    !pricingHint && sampleIndex >= 0 ? samples[sampleIndex] : undefined;

  useEffect(() => {
    if (!idle || pricingHint || samples.length === 0) return;
    let swap: ReturnType<typeof setTimeout>;
    const tick = setInterval(() => {
      setFading(true);
      swap = setTimeout(() => {
        setSampleIndex((i) => (i + 1 >= samples.length ? -1 : i + 1));
        setFading(false);
      }, FADE_MS);
    }, CYCLE_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(swap);
      setFading(false);
    };
  }, [idle, pricingHint, samples.length]);

  // Keep the newest message in view (above the question chips).
  useEffect(() => {
    const log = logRef.current;
    const last = log?.querySelector<HTMLElement>("[data-last]");
    if (!log || !last) return;
    const top = last.offsetTop - log.offsetTop - 12;
    log.scrollTo({ top: Math.min(top, log.scrollHeight), behavior: "smooth" });
  }, [messages, open]);

  // Opens from the nav (FAQs, Pricing, Book a call) and other buttons, or
  // from /?faq, /?pricing and /?book (where the old pages redirect).
  useEffect(() => {
    const isPlan = (id: unknown): id is Plan["id"] =>
      plans.some((p) => p.id === id);
    const show = (view: AskBoxView, plan?: unknown) => {
      if (isPlan(plan)) setCheckoutPlan(plan);
      setMode(view);
      setOpen(true);
    };
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<OpenAskBoxDetail>).detail;
      show(detail?.view ?? "chat", detail?.plan);
    };
    window.addEventListener(OPEN_ASK_BOX_EVENT, onOpen);
    const url = new URL(window.location.href);
    const params: [string, AskBoxView][] = [
      ["faq", "chat"],
      ["pricing", "pricing"],
      ["book", "booking"],
      ["checkout", "checkout"],
    ];
    const found = params.find(([param]) => url.searchParams.has(param));
    if (found) {
      show(found[1], url.searchParams.get(found[0]));
      url.searchParams.delete(found[0]);
      window.history.replaceState(
        null,
        "",
        url.pathname + url.search + url.hash,
      );
    }
    return () => window.removeEventListener(OPEN_ASK_BOX_EVENT, onOpen);
  }, []);

  // Escape closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // FAQ questions not yet asked, offered as chips under the conversation.
  const asked = new Set(
    messages.filter((m) => m.role === "user").map((m) => m.content),
  );
  const remaining = faqs.filter((f) => !asked.has(f.question));
  // Scroll target: the visitor's latest question, so it and its answer show.
  const lastUser = messages.findLastIndex((m) => m.role === "user");

  // A known FAQ is answered from the list, after a short "typing" pause.
  function askFaq(faq: Faq) {
    if (pending) return;
    setMode("chat");
    const history: Message[] = [
      ...messages,
      { role: "user", content: faq.question },
    ];
    setMessages([...history, { role: "assistant", content: "", typing: true }]);
    setPending(true);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setTimeout(
      () => {
        setMessages([...history, { role: "assistant", content: faq.answer }]);
        setPending(false);
      },
      reduced ? 0 : FAQ_TYPING_MS,
    );
  }

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    // With an empty box, Ask sends the sample question on screen.
    const question = input.trim() || (idle ? (sample ?? "") : "");
    if (!question || pending) return;

    const history: Message[] = [
      ...messages,
      { role: "user", content: question },
    ];
    setMessages([...history, { role: "assistant", content: "" }]);
    // The model doesn't need to see its own tags again.
    const outgoing = history.map(({ role, content }) => ({
      role,
      content: role === "assistant" ? parseAnswer(content).text : content,
    }));
    setInput("");
    setMode("chat");
    setOpen(true);
    setPending(true);

    const setAnswer = (content: string, bookCall?: boolean) =>
      setMessages([...history, { role: "assistant", content, bookCall }]);

    try {
      await streamChat(outgoing, (text) => setAnswer(text));
    } catch (error) {
      setAnswer(
        error instanceof ChatError
          ? error.message
          : "Something went wrong. Please try again.",
        error instanceof ChatError && error.bookCall,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {open && (
        <div
          className={styles.backdrop}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className={styles.wrapper}>
        {/* Closed, this is just the ask pill. Open, the pill grows up into a
            panel with the conversation, and the pill stays as its bottom row. */}
        <div
          className={styles.shell}
          data-open={open}
          data-view={open ? mode : undefined}
          role={open ? "dialog" : undefined}
          aria-label={
            open
              ? mode === "chat"
                ? "Questions about Designjoy"
                : VIEW_LABELS[mode]
              : undefined
          }
        >
          {open && (
            <>
              <div className={styles.top}>
                {mode === "checkout" ? (
                  <button
                    type="button"
                    className={styles.back}
                    onClick={() => setMode("pricing")}
                  >
                    <span aria-hidden="true">←</span> Plans
                  </button>
                ) : mode === "booking" ? (
                  <BookCallMeta />
                ) : BARE_VIEWS.includes(mode) ? (
                  <span />
                ) : (
                  <p className={styles.label}>{VIEW_LABELS[mode]}</p>
                )}
                <button
                  type="button"
                  className={styles.close}
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              {mode === "pricing" ? (
                <div className={styles.log}>
                  <PlanPicker embedded />
                </div>
              ) : mode === "booking" ? (
                <div className={styles.log}>
                  <BookCall />
                </div>
              ) : mode === "checkout" ? (
                <div className={styles.log}>
                  <CheckoutPanel planId={checkoutPlan} />
                </div>
              ) : (
                <div ref={logRef} className={styles.log} aria-live="polite">
                  <p className={`${styles.bubble} ${styles.dj}`}>
                    Hi! Tap a question below, or type your own.
                  </p>
                  {messages.map((message, i) => {
                    if (message.role === "user") {
                      return (
                        <p
                          key={i}
                          className={`${styles.bubble} ${styles.me}`}
                          data-last={lastUser === i || undefined}
                        >
                          {message.content}
                        </p>
                      );
                    }
                    if (message.typing || (!message.content && pending)) {
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
                    const { text, bookCall, billing } = parseAnswer(
                      message.content,
                    );
                    const done = !(pending && i === messages.length - 1);
                    return (
                      <div key={i} className={styles.answer}>
                        <p className={`${styles.bubble} ${styles.dj}`}>
                          {text}
                        </p>
                        {done && (bookCall || message.bookCall) && (
                          <button
                            type="button"
                            className={styles.action}
                            onClick={() => setMode("booking")}
                          >
                            Book a 15 min intro call
                          </button>
                        )}
                        {done && billing && (
                          <a
                            href="/billing"
                            target="_blank"
                            rel="noopener"
                            className={styles.action}
                          >
                            Manage billing →
                          </a>
                        )}
                      </div>
                    );
                  })}
                  {remaining.length > 0 && (
                    <div className={styles.chips} aria-label="Common questions">
                      {remaining.map((faq, n) => (
                        <button
                          key={faq.question}
                          type="button"
                          style={{ animationDelay: `${150 + n * 25}ms` }}
                          disabled={pending}
                          onClick={() => askFaq(faq)}
                        >
                          {faq.question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <form
            className={styles.box}
            onSubmit={ask}
            onPointerEnter={(e) =>
              e.pointerType === "mouse" && setHovered(true)
            }
            onPointerLeave={() => setHovered(false)}
          >
            <BotFace
              size={24}
              thinking={pending}
              typing={focused && input.length > 0}
              excited={hovered && !input}
            />
            <label htmlFor="ask-input" className="visually-hidden">
              Ask anything about Designjoy
            </label>
            <div className={styles.field}>
              <input
                ref={inputRef}
                id="ask-input"
                className={styles.input}
                placeholder={idle ? "" : hint}
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => {
                  setFocused(true);
                  if (messages.length > 0) {
                    setMode("chat");
                    setOpen(true);
                  }
                }}
                onBlur={() => setFocused(false)}
              />
              {idle && (
                <span
                  key={sample ?? hint}
                  className={styles.sample}
                  data-fading={fading}
                  aria-hidden="true"
                >
                  {sample ?? hint}
                </span>
              )}
            </div>
            <button
              type="submit"
              className={styles.submit}
              disabled={pending || !(input.trim() || (idle && sample))}
            >
              Ask
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
