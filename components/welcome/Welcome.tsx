"use client";

import { useEffect, useRef, useState } from "react";
import { openAskBox } from "@/lib/ask-box";
import styles from "./Welcome.module.css";

type Props = {
  planId?: string;
  planName?: string;
  email?: string;
  inviteTo?: string;
  eta: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * The page people land on after paying: a membership card for their plan
 * that flips in and tilts toward the pointer, with what happens next below.
 */
export function Welcome({ planId, planName, email, inviteTo, eta }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [since, setSince] = useState("");
  const [number, setNumber] = useState("");
  useEffect(() => {
    const now = new Date();
    setSince(`${MONTHS[now.getMonth()]} ${now.getFullYear()}`);
    // A friendly member number, steady for the day.
    setNumber(String(((now.getFullYear() * 372 + now.getMonth() * 31 + now.getDate()) % 9000) + 1000));
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
            <span className={styles.label}>Member № {number}</span>
          </div>
          <div>
            <p className={styles.label}>Designjoy</p>
            <p className={styles.memberPlan}>{planName ?? "Subscriber"}</p>
          </div>
          <div className={styles.memberFoot}>
            <span>
              <span className={styles.label}>Member since</span>
              {since}
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
          Watch for a Trello invite to {inviteTo ?? "your inbox"} {eta}. Your receipt is on its way
          {email ? ` to ${email}` : ""}.
        </p>
      </header>

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
