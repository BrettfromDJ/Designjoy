"use client";

import { useEffect, useRef, useState } from "react";
import { updateFaqs } from "@/app/admin/actions";
import type { Faq } from "@/content/site";
import { NEXT_STEPS } from "@/lib/chat";
import { MAX_FAQS } from "@/lib/faqs-limits";
import styles from "./FaqsEditor.module.css";
import admin from "./Admin.module.css";

type Status = { kind: "idle" | "saving" | "saved" | "error"; message?: string };
// An FAQ being edited: its answer's text, with the buttons shown after it kept apart.
type Item = { id: string; question: string; text: string; tags: string[] };

const TAGS = Object.keys(NEXT_STEPS) as (keyof typeof NEXT_STEPS)[];

function toItem(faq: Faq): Item {
  const tags = TAGS.filter((tag) => faq.answer.includes(tag));
  let text = faq.answer;
  for (const tag of TAGS) text = text.split(tag).join("");
  return { id: crypto.randomUUID(), question: faq.question, text: text.replace(/\s+$/, ""), tags };
}

function toFaq(item: Item): Faq {
  return {
    question: item.question.trim(),
    answer: [item.text.trim(), ...item.tags].filter(Boolean).join(" "),
  };
}

const blank = (): Item => ({ id: crypto.randomUUID(), question: "", text: "", tags: [] });
const complete = (items: Item[]) => items.map(toFaq).filter((f) => f.question && f.answer);

/**
 * The FAQs shown as tappable questions in the ask box, in order. Each answer
 * can end with buttons (Compare plans, Book a call…) toggled below it.
 */
export function FaqsEditor({
  initial,
  draft,
  storageReady,
}: {
  initial: Faq[];
  /** A new FAQ to start with, e.g. from a question in the log. */
  draft?: Faq;
  storageReady: boolean;
}) {
  const [items, setItems] = useState<Item[]>(() => [
    ...initial.map(toItem),
    ...(draft ? [toItem(draft)] : []),
  ]);
  // Compared in the same tidied form the editor saves, so opening it isn't a change.
  const [saved, setSaved] = useState(() => JSON.stringify(complete(initial.map(toItem))));
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragId, setDragId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(draft ? "last" : null);
  const listRef = useRef<HTMLOListElement>(null);

  const filled = complete(items);
  const dirty = JSON.stringify(filled) !== saved;

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // A newly added FAQ scrolls into view with its question ready to type in.
  useEffect(() => {
    if (!focusId) return;
    const rows = listRef.current?.querySelectorAll<HTMLElement>("[data-row]");
    const row = focusId === "last" ? rows?.[rows.length - 1] : listRef.current?.querySelector<HTMLElement>(`[data-row="${focusId}"]`);
    row?.scrollIntoView({ behavior: "smooth", block: "center" });
    row?.querySelector("input")?.focus({ preventScroll: true });
    setFocusId(null);
  }, [focusId]);

  const patch = (id: string, change: Partial<Item>) => {
    setItems((list) => list.map((f) => (f.id === id ? { ...f, ...change } : f)));
    if (status.kind !== "saving") setStatus({ kind: "idle" });
  };

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function add() {
    const item = blank();
    setItems((list) => [...list, item]);
    setFocusId(item.id);
  }

  async function save() {
    if (!dirty || status.kind === "saving") return;
    setStatus({ kind: "saving" });
    try {
      const result = await updateFaqs(filled);
      setSaved(JSON.stringify(result));
      setItems(result.map(toItem));
      setStatus({ kind: "saved", message: "Saved. The site and the chatbot use them within a minute." });
    } catch {
      setStatus({ kind: "error", message: "That didn't save. Check your connection and try again." });
    }
  }

  const incomplete = items.filter((f) => (f.question.trim() || f.text.trim()) && !(f.question.trim() && f.text.trim())).length;

  return (
    <div className={admin.manager}>
      <header className={admin.header}>
        <div>
          <h1 className={admin.title}>FAQs</h1>
          <p className={admin.hint}>
            The questions visitors can tap in the ask box, in this order, with your written answers.
            The chatbot answers them the same way. Drag to reorder.
          </p>
        </div>
        <div className={admin.headerActions}>
          <span className={admin.hint} aria-live="polite">
            {status.kind === "saving" ? "Saving…" : dirty ? "Unsaved changes" : ""}
          </span>
          <button
            type="button"
            className={admin.primary}
            onClick={save}
            disabled={!storageReady || !dirty || status.kind === "saving"}
          >
            Save
          </button>
        </div>
      </header>

      {!storageReady && (
        <p className={admin.notice}>
          Saving needs Vercel Blob. Connect a Blob store with <code>BLOB_READ_WRITE_TOKEN</code> to the
          project.
        </p>
      )}
      {status.message && (
        <p className={status.kind === "error" ? admin.error : admin.hint} role="status">
          {status.message}
        </p>
      )}
      {incomplete > 0 && (
        <p className={admin.hint}>
          {incomplete === 1 ? "One FAQ is" : `${incomplete} FAQs are`} missing a question or an answer
          and won&apos;t be saved until filled in.
        </p>
      )}

      <ol className={styles.list} ref={listRef}>
        {items.map((f, i) => (
          <li
            key={f.id}
            data-row={f.id}
            className={styles.row}
            data-dragging={dragId === f.id || undefined}
            onDragOver={(e) => {
              if (!dragId) return;
              e.preventDefault();
              const from = items.findIndex((x) => x.id === dragId);
              if (from !== i) move(from, i);
            }}
          >
            <span
              className={styles.handle}
              draggable
              role="button"
              tabIndex={0}
              aria-label={`Reorder "${f.question || "FAQ"}". Use the up and down arrow keys to move it.`}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", f.id);
                setDragId(f.id);
              }}
              onDragEnd={() => setDragId(null)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                  move(i, i + (e.key === "ArrowUp" ? -1 : 1));
                }
              }}
            >
              <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
                {[2, 8, 14].flatMap((y) => [
                  <circle key={`l${y}`} cx="2" cy={y} r="1.5" />,
                  <circle key={`r${y}`} cx="8" cy={y} r="1.5" />,
                ])}
              </svg>
            </span>
            <span className={styles.number}>{i + 1}</span>

            <div className={styles.fields}>
              <label className="visually-hidden" htmlFor={`q-${f.id}`}>
                Question
              </label>
              <input
                id={`q-${f.id}`}
                className={`${admin.field} ${styles.question}`}
                placeholder="Question, e.g. Do you offer refunds?"
                value={f.question}
                maxLength={200}
                onChange={(e) => patch(f.id, { question: e.target.value })}
              />
              <label className="visually-hidden" htmlFor={`a-${f.id}`}>
                Answer
              </label>
              <textarea
                id={`a-${f.id}`}
                className={`${admin.field} ${styles.answer}`}
                placeholder="Answer"
                value={f.text}
                rows={2}
                maxLength={1900}
                onChange={(e) => patch(f.id, { text: e.target.value })}
              />
              <div className={styles.tags} role="group" aria-label="Buttons after the answer">
                <span className={admin.hint}>Buttons after it:</span>
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={styles.tag}
                    aria-pressed={f.tags.includes(tag)}
                    onClick={() =>
                      patch(f.id, {
                        tags: f.tags.includes(tag)
                          ? f.tags.filter((t) => t !== tag)
                          : TAGS.filter((t) => t === tag || f.tags.includes(t)),
                      })
                    }
                  >
                    {NEXT_STEPS[tag].label.replace(/ →$/, "")}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={admin.link}
              onClick={() => setItems((list) => list.filter((x) => x.id !== f.id))}
            >
              Remove
            </button>
          </li>
        ))}
      </ol>

      {items.length < MAX_FAQS && (
        <button type="button" className={styles.add} onClick={add}>
          + Add FAQ
        </button>
      )}
    </div>
  );
}
