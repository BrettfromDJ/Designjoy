"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { openAskBox } from "@/lib/ask-box";
import styles from "./Welcome.module.css";

type Props = {
  planId?: string;
  planName?: string;
  email?: string;
  inviteTo?: string;
  eta: string;
  /** Their member number, from their subscription. */
  member?: number;
  /** When they subscribed, in ms. */
  since?: number;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY = 24 * 3600 * 1000;

const short = (d: Date) => `${DAYS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTHS[d.getMonth()]}`;

/**
 * The page people land on after paying: a membership card for their plan
 * that flips in and tilts toward the pointer, with what happens next below.
 */
export function Welcome({ planId, planName, email, inviteTo, eta, member, since }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const partner = planId === "design-partner";
  // Dates are set after mount so they're in the visitor's own time zone.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  const joined = since ? new Date(since) : today;
  const day = (n: number) => (today ? new Date(+today + n * DAY) : null);

  // Their first few days. Design Partner adds its Slack channel.
  const stops = [
    { when: "Today", title: "Trello invite", body: `Sent to ${inviteTo ?? "your inbox"} ${eta}.`, date: day(0) },
    ...(partner
      ? [
          {
            when: "Today",
            title: "Slack channel",
            body: "We'll add you to a shared channel for daily updates and quick feedback.",
            date: day(0),
          },
        ]
      : []),
    {
      when: "Tomorrow",
      title: "Brief your first request",
      body: "Add it to Backlog and move it into Current request. A few lines is plenty.",
      date: day(1),
    },
    {
      // Named by its date alone ("Mon 19 Oct"), so it doesn't repeat the day.
      when: today ? "" : "In two days",
      title: "First delivery",
      body: partner
        ? "Most requests land in about 48 hours, with progress shared in Slack along the way."
        : "Most requests land in about 48 hours. Revisions take about a day.",
      date: day(2),
    },
  ];

  // The nav sits at the top on this page (set early by the page itself);
  // put it back when leaving.
  useEffect(() => {
    document.body.dataset.navTop = "";
    return () => {
      delete document.body.dataset.navTop;
    };
  }, []);

  // The card tilts toward the pointer, and its light follows it.
  function tilt(event: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    el.style.setProperty("--rx", `${-y * 10}deg`);
    el.style.setProperty("--ry", `${x * 14}deg`);
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  }

  return (
    <main className={styles.page}>
      <div
        className={styles.memberWrap}
        onPointerMove={tilt}
        onPointerLeave={() => ref.current?.removeAttribute("style")}
      >
        <div ref={ref} className={styles.member} data-plan={planId}>
          <div className={styles.memberTop}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/smile.svg" alt="" width={36} height={36} className={styles.memberSmile} />
            {member && <span className={styles.label}>Member № {String(member).padStart(4, "0")}</span>}
          </div>
          <div>
            <p className={styles.label}>Designjoy</p>
            <p className={styles.memberPlan}>{planName ?? "Subscriber"}</p>
          </div>
          <div className={styles.memberFoot}>
            <span>
              <span className={styles.label}>Member since</span>
              {joined ? `${MONTHS[joined.getMonth()]} ${joined.getFullYear()}` : "\u00a0"}
            </span>
            <span>
              <span className={styles.label}>Requests</span>
              One at a time, unlimited
            </span>
          </div>
        </div>
      </div>

      <header className={`${styles.header} ${styles.center}`}>
        <h1 className={styles.title}>
          Welcome to the club. <span className={styles.muted}>You&apos;re in.</span>
        </h1>
        <p className={styles.sub}>
          Your receipt is on its way{email ? ` to ${email}` : ""}. Here&apos;s how your first few days go.
        </p>
      </header>

      <section className={styles.card} aria-label="Your first few days">
        <ol className={styles.timeline}>
          {stops.map((stop, i) => (
            <li key={stop.title} data-now={stop.when === "Today" || undefined} style={{ "--i": i } as CSSProperties}>
              <span className={styles.dot} aria-hidden="true" />
              <p className={styles.label}>
                {stop.when}
                {stop.date && (
                  <span className={styles.date}>
                    {stop.when && " · "}
                    {short(stop.date)}
                  </span>
                )}
              </p>
              <p className={styles.stepTitle}>{stop.title}</p>
              <p className={styles.stepBody}>{stop.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.card} aria-label="Billing and help">
        <a
          href={email ? `/billing?email=${encodeURIComponent(email)}` : "/billing"}
          className={styles.link}
          target="_blank"
          rel="noopener"
        >
          Manage billing <span aria-hidden="true">→</span>
        </a>
        <p className={styles.stepBody}>Update your card, download invoices, or cancel anytime.</p>
        <button type="button" className={styles.link} onClick={() => openAskBox("chat")}>
          Questions? Just ask <span aria-hidden="true">→</span>
        </button>
      </section>
    </main>
  );
}
