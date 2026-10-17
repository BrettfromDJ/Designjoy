"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { openAskBox } from "@/lib/ask-box";
import { CheckIcon } from "../Icons";
import { Lanyard } from "./Lanyard";
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
  /** Show the membership as a badge on a lanyard (the default) or a card. */
  lanyard?: boolean;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


/**
 * The page people land on after paying: a membership card for their plan
 * that flips in and tilts toward the pointer, with what happens next below.
 */
export function Welcome({ planId, planName, email, inviteTo, eta, member, since, lanyard = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const partner = planId === "design-partner";
  // Set after mount so "member since" falls back to the visitor's own date.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  const joined = since ? new Date(since) : today;

  // Where they are: subscribed, then the invites on their way. Slack is
  // for Design Partner only.
  const steps = [
    { title: "Subscribed", body: email ? `Receipt sent to ${email}.` : "Your receipt is on its way.", done: true },
    { title: "Trello invite", body: `On its way to ${inviteTo ?? "your inbox"} ${eta}.` },
    ...(partner ? [{ title: "Slack invite", body: "For daily updates and quick feedback." }] : []),
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

  // What's printed on the card (or badge).
  const face = (
    <>
      <div className={styles.memberTop}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/smile.svg" alt="" width={36} height={36} className={styles.memberSmile} draggable={false} />
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
    </>
  );

  return (
    <main className={styles.page}>
      {lanyard ? (
        <Lanyard partner={partner}>
          <div className={`${styles.member} ${styles.badge}`} data-plan={planId}>
            <span className={styles.slot} aria-hidden="true" />
            {face}
          </div>
        </Lanyard>
      ) : (
        <div
          className={styles.memberWrap}
          onPointerMove={tilt}
          onPointerLeave={() => ref.current?.removeAttribute("style")}
        >
          <div ref={ref} className={styles.member} data-plan={planId}>
            {face}
          </div>
        </div>
      )}

      <header className={`${styles.header} ${styles.center}`}>
        <h1 className={styles.title}>
          Welcome to the club. <span className={styles.muted}>You&apos;re in.</span>
        </h1>
        <p className={styles.sub}>
          Your {planName ?? "subscription"} is active. Watch your inbox for your invites.
        </p>
      </header>

      <section className={styles.card} aria-label="Your progress">
        <ol className={styles.checks}>
          {steps.map((step, i) => (
            <li key={step.title} data-done={step.done || undefined} style={{ "--i": i } as CSSProperties}>
              <span className={styles.check} aria-hidden="true">
                {step.done && <CheckIcon />}
              </span>
              <span>
                <span className={styles.stepTitle}>
                  {step.title}
                  <span className="visually-hidden">{step.done ? " (done)" : " (on its way)"}</span>
                </span>
                <span className={styles.stepBody}>{step.body}</span>
              </span>
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
