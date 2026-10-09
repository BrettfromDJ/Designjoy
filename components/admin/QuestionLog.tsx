"use client";

import { useMemo, useState } from "react";
import { clearQuestionLog } from "@/app/admin/actions";
import type { StoredQuestion } from "@/lib/questions";
import { UnansweredQuestions } from "./UnansweredQuestions";
import styles from "./QuestionLog.module.css";
import admin from "./Admin.module.css";

type Filter = "all" | "typed" | "faq";
const DAY = 24 * 60 * 60 * 1000;

function ago(iso: string, now: number) {
  const s = Math.max(0, Math.round((now - +new Date(iso)) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.round(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

export function QuestionLog({
  questions,
  total,
  storageReady,
}: {
  questions: StoredQuestion[];
  total: number;
  storageReady: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [now] = useState(() => Date.now());

  const lastWeek = questions.filter((q) => now - +new Date(q.at) < 7 * DAY).length;
  const typed = questions.filter((q) => q.source === "typed").length;

  // The FAQ chips people tap most.
  const topFaqs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const q of questions) if (q.source === "faq") counts.set(q.question, (counts.get(q.question) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [questions]);

  const shown = questions.filter(
    (q) =>
      (filter === "all" || q.source === filter) &&
      (!query || `${q.question} ${q.answer}`.toLowerCase().includes(query.toLowerCase())),
  );

  async function clearAll() {
    setClearing(true);
    try {
      await clearQuestionLog();
    } finally {
      setClearing(false);
      setConfirm(false);
    }
  }

  return (
    <div className={admin.manager}>
      <header className={admin.header}>
        <div>
          <h1 className={admin.title}>Questions</h1>
          <p className={admin.hint}>
            Everything asked in the ask box, newest first: typed questions with the chatbot&apos;s answer,
            and FAQ chips people tapped.
          </p>
        </div>
        {questions.length > 0 && (
          <div className={admin.headerActions}>
            {confirm ? (
              <>
                <button type="button" className={admin.danger} onClick={clearAll} disabled={clearing}>
                  {clearing ? "Clearing…" : "Delete all"}
                </button>
                <button type="button" className={admin.link} onClick={() => setConfirm(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className={admin.link} onClick={() => setConfirm(true)}>
                Clear log
              </button>
            )}
          </div>
        )}
      </header>

      {!storageReady && (
        <p className={admin.notice}>
          Logging needs Vercel Blob. Connect a Blob store with <code>BLOB_READ_WRITE_TOKEN</code> to the
          project.
        </p>
      )}

      {storageReady && questions.length === 0 ? (
        <p className={admin.empty}>No questions yet. They&apos;ll show up here as people use the ask box.</p>
      ) : (
        questions.length > 0 && (
          <>
            <UnansweredQuestions questions={questions.filter((q) => q.flagged && !q.resolved)} />

            <dl className={styles.stats}>
              <div>
                <dt>All time</dt>
                <dd>{total.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Last 7 days</dt>
                <dd>{lastWeek.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Typed</dt>
                <dd>{typed.toLocaleString()}</dd>
              </div>
              <div>
                <dt>FAQ taps</dt>
                <dd>{(questions.length - typed).toLocaleString()}</dd>
              </div>
            </dl>

            {topFaqs.length > 0 && (
              <section className={styles.top}>
                <h2 className={styles.label}>Most tapped FAQs</h2>
                <ol>
                  {topFaqs.map(([question, count]) => (
                    <li key={question}>
                      <span>{question}</span>
                      <span className={styles.count}>{count}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <div className={styles.toolbar}>
              <div className={styles.filters} role="group" aria-label="Show">
                {(["all", "typed", "faq"] as Filter[]).map((f) => (
                  <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                    {f === "all" ? "All" : f === "typed" ? "Typed" : "FAQ taps"}
                  </button>
                ))}
              </div>
              <label className="visually-hidden" htmlFor="question-search">
                Search questions
              </label>
              <input
                id="question-search"
                className={`${admin.field} ${styles.search}`}
                placeholder="Search questions and answers"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <ol className={styles.list}>
              {shown.map((q) => (
                <li key={q.url} className={styles.item}>
                  <details>
                    <summary>
                      <span className={styles.question}>{q.question}</span>
                      <span className={styles.meta}>
                        {q.flagged && (
                          <span className={styles.badge}>
                            {q.resolved === "added" ? "Answer added" : q.resolved === "dismissed" ? "Dismissed" : "Unanswered"}
                          </span>
                        )}
                        <span className={styles.badge} data-source={q.source}>
                          {q.source === "typed" ? "Typed" : "FAQ"}
                        </span>
                        {q.page} · <time dateTime={q.at}>{ago(q.at, now)}</time>
                      </span>
                    </summary>
                    <p className={styles.answer}>{q.answer || "No answer recorded."}</p>
                  </details>
                </li>
              ))}
            </ol>
            {shown.length === 0 && <p className={admin.hint}>Nothing matches.</p>}
            {total > questions.length && (
              <p className={admin.hint}>Showing the latest {questions.length.toLocaleString()} of {total.toLocaleString()}.</p>
            )}
          </>
        )
      )}
    </div>
  );
}
