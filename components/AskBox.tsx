"use client";

import { useEffect, useRef, useState } from "react";
import { SparklesIcon } from "./Icons";
import styles from "./AskBox.module.css";

type Message = { role: "user" | "assistant"; content: string };

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
    setInput("");
    setOpen(true);
    setPending(true);

    const setAnswer = (content: string) =>
      setMessages([...history, { role: "assistant", content }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong.");
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
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : "Something went wrong.");
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
            {messages.map((message, i) => (
              <p key={i} className={styles[message.role]}>
                {message.content || <span className={styles.typing}>Thinking…</span>}
              </p>
            ))}
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
