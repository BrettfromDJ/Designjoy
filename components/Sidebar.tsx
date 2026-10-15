"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { scopeOfWork, testimonials, type WorkItem } from "@/content/site";
import { openAskBox } from "@/lib/ask-box";
import { openHowItWorks } from "@/lib/how-it-works";
import { BoardDemo } from "./BoardDemo";
import { PlanPicker } from "./PlanPicker";
import styles from "./Sidebar.module.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Steps through `count` items every `ms`, unless the visitor prefers less motion. */
function useTicker(count: number, ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % count), ms);
    return () => clearInterval(t);
  }, [count, ms]);
  return i;
}

type Section = "pricing" | "scope" | "words";

const quoted = (text: string) => `“${text}”`;

/**
 * Everything that isn't artwork, in one fixed column on the left: the
 * headline, the How it works board, and the homepage tiles as
 * compact rows that open in place. The artwork scrolls on the right.
 */
export function Sidebar({ work }: { work: WorkItem[] }) {
  const [open, setOpen] = useState<Section | null>(null);
  const [day, setDay] = useState("");
  useEffect(() => setDay(DAYS[new Date(Date.now() + 48 * 3600 * 1000).getDay()]), []);

  const service = useTicker(scopeOfWork.length, 1700);
  const quote = useTicker(testimonials.length, 4200);
  const frames = work.filter((w) => w.kind === "image").slice(0, 4);
  const frame = useTicker(frames.length, 900);

  // On wider screens this page has no floating nav, and the ask box sits at
  // the bottom of the work instead of the top (see AskBox.module.css).
  useEffect(() => {
    document.body.dataset.sidebar = "";
    return () => {
      delete document.body.dataset.sidebar;
    };
  }, []);

  const toggle = (s: Section) => setOpen((o) => (o === s ? null : s));
  const t = testimonials[quote];

  return (
    <aside data-hero className={styles.sidebar} aria-label="About Designjoy">
      <div className={styles.inner} data-row-open={open || undefined}>
        <header className={styles.top}>
          <Link href="/" className={styles.logo} aria-label="Designjoy home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/smile.svg" alt="" width={36} height={36} />
          </Link>
          <span className={styles.status}>
            <span className={styles.liveDot} aria-hidden="true" />
            Spots available
          </span>
        </header>

        <div className={styles.intro}>
          <h1 className={styles.title}>Design, on subscription.</h1>
          <p className={styles.sub}>
            Subscribe today and most requests land {day ? `by ${day}` : "in about two days"}.{" "}
            <span className={styles.muted}>Unlimited requests, $4,995 a month, no contracts.</span>
          </p>
        </div>

        <button type="button" className={styles.board} onClick={openHowItWorks}>
          <span className={styles.boardHead}>
            <span className={styles.label}>How it works</span>
            <span className={styles.watch}>
              Watch the tour
              <span className={styles.play} aria-hidden="true">
                <svg width="8" height="8" viewBox="0 0 10 10">
                  <path d="M2.5 1.5v7l6-3.5z" fill="currentColor" />
                </svg>
              </span>
            </span>
          </span>
          <span className={styles.preview}>
            <BoardDemo />
          </span>
        </button>

        <div className={styles.list}>
          <div className={styles.row} data-open={open === "pricing" || undefined}>
            <button type="button" className={styles.rowHead} onClick={() => toggle("pricing")} aria-expanded={open === "pricing"}>
              <span className={styles.rowName}>Pricing</span>
              <span className={styles.rowMeta}>From $4,995/mo</span>
              <Chevron />
            </button>
            {open === "pricing" && (
              <div className={styles.rowBody}>
                <PlanPicker embedded />
              </div>
            )}
          </div>

          <div className={styles.row} data-open={open === "scope" || undefined}>
            <button type="button" className={styles.rowHead} onClick={() => toggle("scope")} aria-expanded={open === "scope"}>
              <span className={styles.rowName}>What we do</span>
              <span className={styles.rowMeta}>
                <span key={service} className={styles.tick}>
                  {scopeOfWork[service]}
                </span>
              </span>
              <Chevron />
            </button>
            {open === "scope" && (
              <ul className={`${styles.rowBody} ${styles.services}`}>
                {scopeOfWork.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            )}
          </div>

          {t && (
            <div className={styles.row} data-open={open === "words" || undefined}>
              <button type="button" className={styles.rowHead} onClick={() => toggle("words")} aria-expanded={open === "words"}>
                <span className={styles.rowName}>Kind words</span>
                <span className={styles.rowMeta}>
                  <span key={quote} className={styles.tick}>
                    {t.name ?? t.company}
                  </span>
                </span>
                <Chevron />
              </button>
              {open === "words" && (
                <div className={`${styles.rowBody} ${styles.words}`}>
                  {testimonials.map((w) => (
                    <figure key={w.quote}>
                      <blockquote>{quoted(w.quote)}</blockquote>
                      <figcaption>
                        {w.name ?? w.company}
                        {w.role && <span className={styles.muted}> · {w.role}</span>}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          )}

          <Link href="/labs/cycles" className={styles.row}>
            <span className={styles.rowHead}>
              <span className={styles.rowName}>Labs</span>
              <span className={styles.rowMeta}>Free tools</span>
              <span className={styles.gif} aria-hidden="true">
                {frames.map((f, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={f.id} src={f.src} alt="" data-on={i === frame || undefined} />
                ))}
              </span>
            </span>
          </Link>
        </div>

        <footer className={styles.foot}>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={() => openAskBox("pricing")}>
              See plans
            </button>
            <button type="button" className={styles.secondary} onClick={() => openAskBox("booking")}>
              Book a call
            </button>
          </div>
          <p className={styles.legal}>
            <span>© {new Date().getFullYear()} Designjoy</span>
            <button type="button" onClick={() => openAskBox("chat")}>
              FAQs
            </button>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </p>
        </footer>
      </div>
    </aside>
  );
}

function Chevron() {
  return (
    <svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2.5 3.75 5 6.25l2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
