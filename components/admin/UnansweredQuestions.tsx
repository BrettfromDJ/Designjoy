"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveAnswer, dismissQuestion } from "@/app/admin/actions";
import type { StoredQuestion } from "@/lib/questions";
import styles from "./QuestionLog.module.css";
import admin from "./Admin.module.css";

/** One question the chatbot couldn't answer, with a drafted answer to edit and approve. */
function Unanswered({ q, onDone }: { q: StoredQuestion; onDone: () => void }) {
  const [answer, setAnswer] = useState(q.suggestion ?? "");
  const [busy, setBusy] = useState<"add" | "dismiss" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const placeholders = /\[[^\]]+\]/.test(answer);

  async function add() {
    setBusy("add");
    setError(null);
    const result = await approveAnswer(q.url, q.question, answer);
    setBusy(null);
    if (result.error) setError(result.error);
    else onDone();
  }

  async function dismiss() {
    setBusy("dismiss");
    try {
      await dismissQuestion(q.url);
      onDone();
    } catch {
      setError("That didn't save. Try again.");
      setBusy(null);
    }
  }

  return (
    <li className={styles.flagged}>
      <p className={styles.question}>{q.question}</p>
      <p className={styles.meta}>
        {q.page} · asked {new Date(q.at).toLocaleDateString([], { month: "short", day: "numeric" })}
      </p>
      <label className={styles.label} htmlFor={`answer-${q.url}`}>
        {q.suggestion ? "Suggested answer · edit before adding" : "Your answer"}
      </label>
      <textarea
        id={`answer-${q.url}`}
        className={styles.answerField}
        value={answer}
        rows={3}
        placeholder="Write the answer the chatbot should give."
        onChange={(e) => setAnswer(e.target.value)}
      />
      {placeholders && <p className={admin.hint}>Replace the [bracketed] parts with the real details.</p>}
      {error && (
        <p className={admin.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.flaggedActions}>
        <button
          type="button"
          className={admin.primary}
          onClick={add}
          disabled={busy !== null || !answer.trim() || placeholders}
        >
          {busy === "add" ? "Adding…" : "Add to knowledge base"}
        </button>
        <button type="button" className={admin.link} onClick={dismiss} disabled={busy !== null}>
          {busy === "dismiss" ? "Dismissing…" : "Dismiss"}
        </button>
      </div>
    </li>
  );
}

/**
 * Questions the chatbot couldn't answer. Approving one adds it to the
 * knowledge base, so the chatbot answers it from then on.
 */
export function UnansweredQuestions({ questions }: { questions: StoredQuestion[] }) {
  const router = useRouter();
  const [done, setDone] = useState<Set<string>>(new Set());
  const open = questions.filter((q) => !done.has(q.url));
  if (!open.length) return null;

  return (
    <section className={styles.needs} aria-labelledby="needs-title">
      <div>
        <h2 id="needs-title" className={styles.needsTitle}>
          Needs an answer <span className={styles.count}>{open.length}</span>
        </h2>
        <p className={admin.hint}>
          The chatbot couldn&apos;t answer these from the knowledge base. Add an answer and it will
          answer them from now on.
        </p>
      </div>
      <ol className={styles.list}>
        {open.map((q) => (
          <Unanswered
            key={q.url}
            q={q}
            onDone={() => {
              setDone((d) => new Set(d).add(q.url));
              router.refresh();
            }}
          />
        ))}
      </ol>
    </section>
  );
}
