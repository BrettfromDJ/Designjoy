"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { openAskBox } from "@/lib/ask-box";
import { BotFace } from "./BotFace";
import styles from "./CallCard.module.css";

/*
 * Ways to offer the 15 min intro call in the sidebar, previewed with
 * ?call=1…5 and a small switcher. Without ?call there's no card.
 */
const VARIANTS = ["Simple", "Next open times", "Say hi", "One line", "This week"] as const;

function useVariant() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const v = Number(new URLSearchParams(window.location.search).get("call"));
    if (v >= 1 && v <= VARIANTS.length) setN(v);
  }, []);
  const go = (to: number) => {
    const next = ((to - 1 + VARIANTS.length) % VARIANTS.length) + 1;
    const url = new URL(window.location.href);
    url.searchParams.set("call", String(next));
    window.history.replaceState(null, "", url);
    setN(next);
  };
  return [n, go] as const;
}

type Days = Record<string, string[]>;

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayOf = (key: string) => new Date(`${key}T12:00:00`);

/** Open times over the next week, in the visitor's time zone; null until loaded or if it fails. */
function useSlots(enabled: boolean) {
  const [days, setDays] = useState<Days | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    const params = new URLSearchParams({ start: isoDate(start), end: isoDate(end), tz });
    fetch(`/api/booking/slots?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("slots"))))
      .then((data: { days?: Days }) => setDays(data.days ?? {}))
      .catch(() => {});
  }, [enabled]);
  return days;
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
const fmtDay = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short" });
};

/** "Not sure yet?" — a card offering the 15 min intro call; opens booking in the ask box. */
export function CallCard() {
  const [variant, go] = useVariant();
  const days = useSlots(variant === 2 || variant === 5);
  if (!variant) return null;

  const book = () => openAskBox("booking");
  const arrow = <span aria-hidden="true">→</span>;

  // The first few open times, a couple from each day.
  const next = days
    ? Object.values(days)
        .flatMap((times) => times.slice(0, 2))
        .slice(0, 3)
    : [];

  let card: React.ReactNode;
  if (variant === 1) {
    card = (
      <div className={styles.card}>
        <p className={styles.label}>Not sure yet?</p>
        <p className={styles.title}>Hop on a quick call and see if we&apos;re a fit.</p>
        <p className={styles.sub}>15 minutes, on video. No pitch, just answers.</p>
        <button type="button" className={styles.button} onClick={book}>
          Book a 15 min intro call
        </button>
      </div>
    );
  } else if (variant === 2) {
    card = (
      <div className={styles.card}>
        <div className={styles.head}>
          <p className={styles.label}>Not sure yet?</p>
          <span className={styles.live}>
            <span className={styles.dot} aria-hidden="true" />
            Open this week
          </span>
        </div>
        <p className={styles.title}>Grab 15 minutes with us.</p>
        <div className={styles.slots}>
          {next.length > 0
            ? next.map((iso) => (
                <button key={iso} type="button" className={styles.slot} onClick={book}>
                  <span>{fmtDay(iso)}</span>
                  {fmtTime(iso)}
                </button>
              ))
            : [0, 1, 2].map((i) => <span key={i} className={styles.slotEmpty} aria-hidden="true" />)}
        </div>
        <button type="button" className={styles.more} onClick={book}>
          See all times {arrow}
        </button>
      </div>
    );
  } else if (variant === 3) {
    card = (
      <div className={`${styles.card} ${styles.hi}`}>
        <div className={styles.bubble}>
          <span className={styles.face}>
            <BotFace size={32} />
          </span>
          <p>
            Not sure yet? Let&apos;s talk it through. 15 minutes, on video, and you&apos;ll know if
            Designjoy is right for you.
          </p>
        </div>
        <button type="button" className={styles.button} onClick={book}>
          Pick a time {arrow}
        </button>
      </div>
    );
  } else if (variant === 4) {
    card = (
      <button type="button" className={`${styles.card} ${styles.row}`} onClick={book}>
        <span className={styles.face}>
          <BotFace size={28} />
        </span>
        <span className={styles.rowText}>
          <b>Not sure yet?</b>
          <span>Book a 15 min intro call</span>
        </span>
        <span className={styles.rowArrow} aria-hidden="true">
          →
        </span>
      </button>
    );
  } else {
    // The next five weekdays, with how many times are open on each.
    const week: string[] = [];
    for (let d = new Date(); week.length < 5; d = new Date(d.getTime() + 86400000)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) week.push(isoDate(d));
    }
    card = (
      <div className={styles.card}>
        <p className={styles.label}>Not sure yet?</p>
        <p className={styles.title}>Book a 15 min intro call.</p>
        <div className={styles.week}>
          {week.map((key) => {
            const open = days?.[key]?.length ?? 0;
            return (
              <button
                key={key}
                type="button"
                className={styles.day}
                data-open={open > 0 || undefined}
                onClick={book}
                disabled={days !== null && !open}
              >
                <span>{dayOf(key).toLocaleDateString("en-US", { weekday: "short" })}</span>
                <b>{dayOf(key).getDate()}</b>
                <i aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <p className={styles.sub}>Video call · times in your time zone</p>
      </div>
    );
  }

  return (
    <>
      {/* Arrives after the sidebar's entrance has started, so it marks itself in. */}
      <div data-in="">{card}</div>
      {createPortal(
      <div className={styles.switcher} role="group" aria-label="Call card preview">
        <button type="button" onClick={() => go(variant - 1)} aria-label="Previous">
          ‹
        </button>
        <span>
          <b>{variant}</b>/{VARIANTS.length} · {VARIANTS[variant - 1]}
        </span>
        <button type="button" onClick={() => go(variant + 1)} aria-label="Next">
          ›
        </button>
      </div>,
      document.body,
      )}
    </>
  );
}
