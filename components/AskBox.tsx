"use client";

import { useEffect, useRef, useState } from "react";
import { calTrigger } from "@/lib/cal";
import { parseAnswer } from "@/lib/chat";
import { SparklesIcon } from "./Icons";
import styles from "./AskBox.module.css";

// `content` keeps the raw answer; `bookCall` forces the booking button (used for errors).
type Message = { role: "user" | "assistant"; content: string; bookCall?: boolean };

export function AskBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    const question = input.trim();
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: outgoing }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        setAnswer(data?.error ?? "Something went wrong. Please try again.", Boolean(data?.bookCall));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setAnswer(answer);
      }
    } catch {
      setAnswer("Couldn't reach the chat. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

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

      <form className={styles.box} onSubmit={ask}>
        <SparklesIcon />
        <label htmlFor="ask-input" className="visually-hidden">
          Ask anything about Designjoy
        </label>
        <input
          id="ask-input"
          className={styles.input}
          placeholder="Ask anything about Designjoy"
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => messages.length > 0 && setOpen(true)}
        />
        <button type="submit" className={styles.submit} disabled={pending || !input.trim()}>
          Ask
        </button>
      </form>
    </div>
  );
}
