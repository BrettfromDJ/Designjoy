"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { calTrigger } from "@/lib/cal";
import { parseAnswer } from "@/lib/chat";
import { ChatError, streamChat } from "@/lib/chat-client";
import { BotFace } from "./BotFace";
import styles from "./AskBox.module.css";

// `content` keeps the raw answer; `bookCall` forces the booking button (used for errors).
type Message = { role: "user" | "assistant"; content: string; bookCall?: boolean };

const PLACEHOLDER = "Ask anything about Designjoy";
const SHORT_PLACEHOLDER = "Ask about Designjoy";
const CYCLE_MS = 3200;
const FADE_MS = 300;

/**
 * Sample questions from the knowledge base, plus the placeholder, keeping
 * only text that fits the input without cutting off.
 */
function useSampleQuestions(inputRef: React.RefObject<HTMLInputElement | null>) {
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
      const fits = (text: string) => ctx.measureText(text).width + spacing * text.length <= room;
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
  // The FAQ page is a chat already, so the pill would be redundant there,
  // and on checkout it would sit over the payment form.
  const pathname = usePathname();
  const hidden = pathname === "/faqs" || pathname === "/checkout";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [keystrokes, setKeystrokes] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle the placeholder through sample questions while the box is idle.
  const { samples, placeholder } = useSampleQuestions(inputRef);
  const [sampleIndex, setSampleIndex] = useState(-1); // -1 shows the default placeholder
  const [fading, setFading] = useState(false);
  const idle = !focused && !input && !pending;
  const sample = sampleIndex >= 0 ? samples[sampleIndex] : undefined;

  useEffect(() => {
    if (!idle || samples.length === 0) return;
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
  }, [idle, samples.length]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    // With an empty box, Ask sends the sample question on screen.
    const question = input.trim() || (idle ? (sample ?? "") : "");
    if (!question || pending) return;

    const history: Message[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    // The model doesn't need to see its own tags again.
    const outgoing = history.map(({ role, content }) => ({
      role,
      content: role === "assistant" ? parseAnswer(content).text : content,
    }));
    setInput("");
    setOpen(true);
    setPending(true);

    const setAnswer = (content: string, bookCall?: boolean) =>
      setMessages([...history, { role: "assistant", content, bookCall }]);

    try {
      await streamChat(outgoing, (text) => setAnswer(text));
    } catch (error) {
      setAnswer(
        error instanceof ChatError ? error.message : "Something went wrong. Please try again.",
        error instanceof ChatError && error.bookCall,
      );
    } finally {
      setPending(false);
    }
  }

  if (hidden) return null;

  return (
    <div className={styles.wrapper}>
      {open && messages.length > 0 && (
        <div className={styles.panel} role="dialog" aria-label="Ask Designjoy">
          <button type="button" className={styles.close} onClick={() => setOpen(false)}>
            Close
          </button>
          <div ref={logRef} className={styles.log} aria-live="polite">
            {messages.map((message, i) => {
              if (message.role === "user") {
                return (
                  <p key={i} className={styles.user}>
                    {message.content}
                  </p>
                );
              }
              const { text, bookCall } = parseAnswer(message.content);
              const done = !(pending && i === messages.length - 1);
              return (
                <div key={i} className={styles.answer}>
                  <p className={styles.assistant}>
                    {text || <span className={styles.typing}>Thinking…</span>}
                  </p>
                  {done && (bookCall || message.bookCall) && (
                    <button
                      type="button"
                      className={styles.bookCall}
                      onClick={() => setOpen(false)}
                      {...calTrigger}
                    >
                      Book a 15 min intro call
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <form
        className={styles.box}
        onSubmit={ask}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <BotFace
          size={24}
          thinking={pending}
          typing={focused && input.length > 0}
          excited={hovered && !input}
          poke={keystrokes}
        />
        <label htmlFor="ask-input" className="visually-hidden">
          Ask anything about Designjoy
        </label>
        <div className={styles.field}>
          <input
            ref={inputRef}
            id="ask-input"
            className={styles.input}
            placeholder={idle ? "" : placeholder}
            autoComplete="off"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setKeystrokes((n) => n + 1);
            }}
            onFocus={() => {
              setFocused(true);
              if (messages.length > 0) setOpen(true);
            }}
            onBlur={() => setFocused(false)}
          />
          {idle && (
            <span
              key={sample ?? placeholder}
              className={styles.sample}
              data-fading={fading}
              aria-hidden="true"
            >
              {sample ?? placeholder}
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
  );
}
